import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { Cabecera } from "@/componentes/cabecera";
import { Texto } from "@/componentes/texto";
import { EscalaRepositorio } from "@/datos/escala-repositorio";
import { Escala } from "@/dominio/escala";
import { colores } from "@/tema/colores";
import { useMargenInferior } from "@/tema/margenes";

export default function PantallaEscalas() {
  const db = useSQLiteContext();
  const margenInferior = useMargenInferior();

  const [escalas, setEscalas] = useState<Escala[]>([]);

  useEffect(() => {
    new EscalaRepositorio(db).todas().then(setEscalas);
  }, [db]);

  return (
    <View style={styles.pantalla}>
      <Cabecera titulo="Escalas" subtitulo="¿Qué quieres valorar?" />

      <FlatList
        contentContainerStyle={[styles.contenedor, { paddingBottom: margenInferior + 16 }]}
        data={escalas}
        keyExtractor={(escala) => escala.codigo}
        renderItem={({ item }) => {
          const { min, max } = item.rangoPuntos();
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/escalas/${item.codigo}`)}
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
                  <Texto variante="nota">{item.definicion.items.length} ítems</Texto>
                </View>
                <View style={styles.chip}>
                  <Texto variante="nota">
                    {min} a {max} puntos
                  </Texto>
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
  contenedor: { padding: 16, gap: 10 },
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
