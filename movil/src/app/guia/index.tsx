import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { Cabecera } from "@/componentes/cabecera";
import { Texto } from "@/componentes/texto";
import { GuiaRepositorio } from "@/datos/guia-repositorio";
import { Guia } from "@/dominio/guia";
import { colores } from "@/tema/colores";

export default function PantallaGuias() {
  const db = useSQLiteContext();

  const [guias, setGuias] = useState<Guia[]>([]);

  useEffect(() => {
    new GuiaRepositorio(db).todas().then(setGuias);
  }, [db]);

  return (
    <View style={styles.pantalla}>
      <Cabecera titulo="Guía de curas" />

      <FlatList
        contentContainerStyle={styles.contenedor}
        data={guias}
        keyExtractor={(guia) => guia.codigo}
        ListEmptyComponent={<Texto variante="nota">Todavía no hay guías.</Texto>}
        renderItem={({ item }) => {
          const nodos = item.arbol.nodos;
          const preguntas = nodos.filter((nodo) => nodo.tipo === "pregunta").length;
          const recomendaciones = nodos.length - preguntas;
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/guia/${item.codigo}`)}
              style={({ pressed }) => [styles.tarjeta, pressed && styles.pulsado]}
            >
              <View style={styles.fila}>
                <Texto variante="seccion" style={styles.flex}>
                  {item.nombre}
                </Texto>
                <Ionicons name="chevron-forward" size={22} color={colores.acento} />
              </View>
              <View style={styles.chips}>
                <View style={styles.chip}>
                  <Texto variante="nota">{preguntas} preguntas</Texto>
                </View>
                <View style={styles.chip}>
                  <Texto variante="nota">{recomendaciones} recomendaciones</Texto>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { padding: 16, paddingBottom: 40, gap: 10 },
  tarjeta: { padding: 18, gap: 10, borderRadius: 28, backgroundColor: colores.menta },
  pulsado: { opacity: 0.85 },
  fila: { flexDirection: "row", alignItems: "center", gap: 12 },
  flex: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colores.blanco,
  },
});
