import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Stack from "expo-router/stack";
import { useSQLiteContext } from "expo-sqlite";
import { GuiaRepositorio } from "@/datos/guia-repositorio";
import { Guia } from "@/dominio/guia";
import { colores } from "@/tema/colores";

export default function PantallaGuia() {
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const db = useSQLiteContext();

  const [guia, setGuia] = useState<Guia | null>(null);
  // Nodos recorridos, del primero al actual. Sirve para volver atrás.
  const [camino, setCamino] = useState<string[]>([]);

  useEffect(() => {
    new GuiaRepositorio(db).porCodigo(codigo).then((leida) => {
      setGuia(leida);
      setCamino(leida === null ? [] : [leida.arbol.inicio]);
    });
  }, [db, codigo]);

  if (guia === null || camino.length === 0) {
    return <View style={styles.pantalla} />;
  }

  const nodo = guia.nodo(camino[camino.length - 1]);

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Stack.Screen options={{ title: guia.nombre }} />

      {nodo.tipo === "pregunta" ? (
        <View style={styles.bloque}>
          <Text style={styles.pregunta}>{nodo.texto}</Text>
          {nodo.respuestas.map((respuesta) => (
            <Pressable
              key={respuesta.texto}
              style={styles.opcion}
              onPress={() => setCamino([...camino, respuesta.siguiente])}
            >
              <Text style={styles.opcionTexto}>{respuesta.texto}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        // Pantalla de recomendación (R05F02T01).
        <View style={styles.recomendacion}>
          <Text style={styles.etiqueta}>Recomendación</Text>
          <Text style={styles.recomendacionTexto}>{nodo.texto}</Text>
          {nodo.fuente !== null && <Text style={styles.fuente}>Fuente: {nodo.fuente}</Text>}
        </View>
      )}

      {/* Botón de volver (R05F01T01): quita el último paso. */}
      {camino.length > 1 && (
        <Pressable style={styles.secundario} onPress={() => setCamino(camino.slice(0, -1))}>
          <Text style={styles.secundarioTexto}>← Volver</Text>
        </Pressable>
      )}

      {nodo.tipo === "recomendacion" && (
        <Pressable style={styles.boton} onPress={() => setCamino([guia.arbol.inicio])}>
          <Text style={styles.botonTexto}>Empezar de nuevo</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { padding: 16, gap: 16 },
  bloque: { gap: 8 },
  pregunta: { color: colores.texto, fontSize: 18, fontWeight: "600" },
  opcion: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionTexto: { color: colores.texto, fontSize: 16 },
  recomendacion: {
    padding: 12,
    gap: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colores.acento,
    backgroundColor: colores.superficie,
  },
  etiqueta: { color: colores.acento, fontSize: 14, fontWeight: "600" },
  recomendacionTexto: { color: colores.texto, fontSize: 18 },
  fuente: { color: colores.textoSecundario, fontSize: 14 },
  secundario: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  secundarioTexto: { color: colores.texto, fontSize: 16 },
  boton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colores.primario,
  },
  botonTexto: { color: colores.texto, fontSize: 16, fontWeight: "600" },
});
