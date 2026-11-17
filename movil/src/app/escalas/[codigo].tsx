import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Stack from "expo-router/stack";
import { useSQLiteContext } from "expo-sqlite";
import { EscalaRepositorio } from "@/datos/escala-repositorio";
import { Escala, type Opcion, type Respuestas } from "@/dominio/escala";
import { colores } from "@/tema/colores";

export default function PantallaEscala() {
  // /escalas/news2 da codigo = "news2".
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const db = useSQLiteContext();

  const [escala, setEscala] = useState<Escala | null>(null);
  // Escala 1 o 2 de SpO2. null si la escala no tiene selector.
  const [variante, setVariante] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Respuestas>({});

  useEffect(() => {
    new EscalaRepositorio(db).porCodigo(codigo).then((leida) => {
      setEscala(leida);
      // Se empieza por la variante por defecto.
      setVariante(leida?.definicion.selector?.porDefecto ?? null);
    });
  }, [db, codigo]);

  function responder(itemId: string, opcion: Opcion) {
    setRespuestas({ ...respuestas, [itemId]: opcion });
  }

  // Al cambiar la variante se borran las respuestas de la otra (R04F02T02).
  function cambiarVariante(nueva: string) {
    const conservadas: Respuestas = {};
    for (const [itemId, opcion] of Object.entries(respuestas)) {
      if (opcion.variante === null) {
        conservadas[itemId] = opcion;
      }
    }
    setVariante(nueva);
    setRespuestas(conservadas);
  }

  if (escala === null) {
    return <View style={styles.pantalla} />;
  }

  const { items, selector, fuente } = escala.definicion;
  const total = escala.total(respuestas);
  const respondidos = Object.keys(respuestas).length;

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Stack.Screen options={{ title: escala.nombre }} />

      {selector !== null && (
        <View style={styles.bloque}>
          <Text style={styles.pregunta}>Escala de SpO₂</Text>
          <View style={styles.selector}>
            {selector.opciones.map((opcion) => (
              <Pressable
                key={opcion}
                style={[styles.opcion, styles.opcionSelector, variante === opcion && styles.opcionActiva]}
                onPress={() => cambiarVariante(opcion)}
              >
                <Text style={styles.opcionTexto}>Escala {opcion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {items.map((item) => (
        <View key={item.id} style={styles.bloque}>
          <Text style={styles.pregunta}>{item.texto}</Text>
          {/* Un botón por opción, según la definición (R04F02T01). */}
          {escala.opcionesDe(item, variante).map((opcion) => {
            const elegida = respuestas[item.id]?.texto === opcion.texto;
            return (
              <Pressable
                key={opcion.texto}
                style={[styles.opcion, elegida && styles.opcionActiva]}
                accessibilityRole="button"
                accessibilityState={{ selected: elegida }}
                onPress={() => responder(item.id, opcion)}
              >
                <Text style={[styles.opcionTexto, styles.opcionNombre]}>{opcion.texto}</Text>
                <Text style={styles.opcionTexto}>{opcion.puntos}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {escala.parametroRojo(respuestas) && (
        <View style={[styles.caja, styles.cajaAviso]}>
          <Text style={styles.textoAviso}>
            ⚠ Hay un parámetro con {escala.definicion.avisoSiItemPuntua} puntos.
          </Text>
        </View>
      )}

      {total === null ? (
        <Text style={styles.pendiente}>
          Responde todos los ítems para ver el total ({respondidos} de {items.length}).
        </Text>
      ) : (
        <View style={styles.resultado}>
          <Text style={styles.resultadoValor}>{total} puntos</Text>
          <Text style={styles.resultadoTexto}>{escala.interpretar(total)}</Text>
        </View>
      )}

      <Pressable style={styles.borrar} onPress={() => setRespuestas({})}>
        <Text style={styles.opcionTexto}>Borrar respuestas</Text>
      </Pressable>

      <Text style={styles.fuente}>{fuente}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { padding: 16, gap: 16 },
  bloque: { gap: 8 },
  pregunta: { color: colores.texto, fontSize: 18, fontWeight: "600" },
  selector: { flexDirection: "row", gap: 8 },
  opcion: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionSelector: { flex: 1, justifyContent: "center" },
  opcionActiva: { backgroundColor: colores.primario, borderWidth: 2, borderColor: colores.acento },
  opcionTexto: { color: colores.texto, fontSize: 16 },
  opcionNombre: { flex: 1 },
  caja: { padding: 12, borderRadius: 8 },
  cajaAviso: { backgroundColor: colores.avisoFondo },
  textoAviso: { color: colores.avisoTexto, fontSize: 16, fontWeight: "600" },
  pendiente: { color: colores.textoSecundario, fontSize: 16 },
  resultado: {
    padding: 12,
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  resultadoValor: { color: colores.texto, fontSize: 28, fontWeight: "700" },
  resultadoTexto: { color: colores.texto, fontSize: 16 },
  borrar: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  fuente: { color: colores.textoSecundario, fontSize: 12 },
});
