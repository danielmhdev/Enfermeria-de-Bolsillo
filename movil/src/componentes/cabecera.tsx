import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Texto } from "@/componentes/texto";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

type Props = {
  titulo: string;
  subtitulo?: string;
  volver?: string;
  derecha?: ReactNode;
};

// Píldora para volver, título y subtítulo.
export function Cabecera({ titulo, subtitulo, volver = "Inicio", derecha }: Props) {
  // Espacio de la isla dinámica y la barra de estado.
  const margenes = useSafeAreaInsets();
  return (
    <View style={[styles.cabecera, { paddingTop: margenes.top + 8 }]}>
      <View style={styles.fila}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Volver a ${volver}`}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.volver, pressed && styles.pulsado]}
        >
          <Ionicons name="chevron-back" size={22} color={colores.acento} />
          <Text style={styles.volverTexto}>{volver}</Text>
        </Pressable>
        {derecha}
      </View>
      <View style={styles.titulos}>
        <Texto variante="titulo" accessibilityRole="header">
          {titulo}
        </Texto>
        {subtitulo !== undefined && <Texto variante="subtitulo">{subtitulo}</Texto>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecera: { paddingHorizontal: 16, paddingBottom: 6, gap: 10, backgroundColor: colores.blanco },
  fila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  volver: {
    height: 48,
    paddingLeft: 10,
    paddingRight: 18,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colores.menta,
  },
  pulsado: { opacity: 0.85 },
  volverTexto: { fontFamily: fuentes.extra, fontSize: 17, color: colores.acento },
  titulos: { paddingLeft: 4, gap: 2 },
});
