import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { Boton } from "@/componentes/boton";
import { Cabecera } from "@/componentes/cabecera";
import { Pie } from "@/componentes/pie";
import { Tarjeta } from "@/componentes/tarjeta";
import { Texto } from "@/componentes/texto";
import { GuiaRepositorio } from "@/datos/guia-repositorio";
import { Guia } from "@/dominio/guia";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

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
  // Preguntas por las que se ha pasado, contando la actual.
  const numero = camino.filter((id) => guia.nodo(id).tipo === "pregunta").length;
  // La recomendación se parte por párrafos sin cambiar los datos.
  const [principal, ...resto] = nodo.texto.split("\n\n");

  // Botón de volver (R05F01T01): quita el último paso.
  function volver() {
    setCamino(camino.slice(0, -1));
  }

  return (
    <View style={styles.pantalla}>
      <Cabecera titulo="Guía de curas" subtitulo={guia.nombre} volver="Guías" />

      <ScrollView style={styles.flex} contentContainerStyle={styles.contenedor}>
        {nodo.tipo === "pregunta" ? (
          <>
            <Tarjeta destacada>
              <Texto variante="etiqueta">Pregunta {numero}</Texto>
              <Text style={styles.pregunta}>{nodo.texto}</Text>
            </Tarjeta>
            {nodo.respuestas.map((respuesta) => (
              <Pressable
                key={respuesta.texto}
                accessibilityRole="button"
                onPress={() => setCamino([...camino, respuesta.siguiente])}
                style={({ pressed }) => [styles.respuesta, pressed && styles.pulsado]}
              >
                <Text style={styles.respuestaTexto}>{respuesta.texto}</Text>
                <View style={styles.flecha}>
                  <Ionicons name="chevron-forward" size={20} color={colores.acento} />
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          // Pantalla de recomendación (R05F02T01).
          <>
            <Tarjeta destacada>
              <View style={styles.fila}>
                <Ionicons name="checkmark" size={18} color={colores.texto} />
                <Texto variante="etiqueta">Recomendación</Texto>
              </View>
              <Text style={styles.principal}>{principal}</Text>
            </Tarjeta>
            {resto.map((parrafo) => (
              <Tarjeta key={parrafo}>
                <Texto>{parrafo}</Texto>
              </Tarjeta>
            ))}
          </>
        )}

        {nodo.fuente !== null && (
          <Texto variante="nota" style={styles.margen}>
            Fuente: {nodo.fuente}
          </Texto>
        )}
      </ScrollView>

      {nodo.tipo === "recomendacion" ? (
        <Pie>
          <View style={styles.fila}>
            <Boton texto="Volver" variante="secundario" alPulsar={volver} />
            <View style={styles.flex}>
              <Boton
                texto="Empezar de nuevo"
                icono="refresh"
                alPulsar={() => setCamino([guia.arbol.inicio])}
              />
            </View>
          </View>
        </Pie>
      ) : (
        camino.length > 1 && (
          <Pie>
            <Boton
              texto="Volver a la anterior"
              variante="secundario"
              icono="chevron-back"
              alPulsar={volver}
            />
          </Pie>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { padding: 16, paddingBottom: 24, gap: 10 },
  fila: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex: { flex: 1 },
  pregunta: { fontFamily: fuentes.extra, fontSize: 20, lineHeight: 26, color: colores.texto },
  principal: { fontFamily: fuentes.extra, fontSize: 18, lineHeight: 25, color: colores.texto },
  respuesta: {
    minHeight: 56,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colores.borde,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colores.blanco,
  },
  respuestaTexto: { flex: 1, fontFamily: fuentes.extra, fontSize: 17, lineHeight: 22, color: colores.texto },
  flecha: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.menta,
  },
  margen: { marginHorizontal: 8 },
  pulsado: { opacity: 0.85 },
});
