import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

type Props = {
  texto: string;
  detalle?: string;
  seleccionada: boolean;
  alPulsar: () => void;
  // Más pequeña, para zonas con poco sitio. Sigue midiendo 48 de alto.
  compacta?: boolean;
};

// La elegida lleva fondo menta, borde azul y ✓: no depende solo del color.
export function Opcion({ texto, detalle, seleccionada, alPulsar, compacta = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionada }}
      onPress={alPulsar}
      style={({ pressed }) => [
        styles.opcion,
        compacta && styles.opcionCompacta,
        seleccionada && styles.elegida,
        pressed && styles.pulsada,
      ]}
    >
      <View style={styles.fila}>
        {seleccionada && <Ionicons name="checkmark" size={compacta ? 16 : 18} color={colores.texto} />}
        <Text style={[styles.texto, compacta && styles.textoCompacto]}>{texto}</Text>
      </View>
      {/* El gris secundario sobre menta fuerte no llega a 4,5:1. */}
      {detalle !== undefined && (
        <Text style={[styles.detalle, seleccionada && styles.detalleElegida]}>{detalle}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  opcion: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionCompacta: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 24 },
  elegida: { backgroundColor: colores.primario, borderColor: colores.acento },
  pulsada: { opacity: 0.85 },
  fila: { flexDirection: "row", alignItems: "center", gap: 6 },
  texto: { fontFamily: fuentes.extra, fontSize: 16, color: colores.texto, textAlign: "center" },
  textoCompacto: { fontSize: 14 },
  detalle: { fontFamily: fuentes.normal, fontSize: 13, color: colores.textoSecundario },
  detalleElegida: { color: colores.texto },
});
