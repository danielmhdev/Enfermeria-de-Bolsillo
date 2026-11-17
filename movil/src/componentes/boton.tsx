import { Pressable, StyleSheet, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

type Variante = "principal" | "secundario" | "peligro";

type Props = {
  texto: string;
  alPulsar: () => void;
  variante?: Variante;
  icono?: keyof typeof Ionicons.glyphMap;
};

const COLOR_TEXTO = {
  principal: colores.texto,
  secundario: colores.acento,
  peligro: colores.errorTexto,
};

// Botón en píldora de 60 de alto.
export function Boton({ texto, alPulsar, variante = "principal", icono }: Props) {
  const color = COLOR_TEXTO[variante];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={alPulsar}
      style={({ pressed }) => [styles.boton, styles[variante], pressed && styles.pulsado]}
    >
      {icono !== undefined && <Ionicons name={icono} size={22} color={color} />}
      <Text style={[styles.texto, { color }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 60,
    paddingHorizontal: 22,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  principal: { backgroundColor: colores.primario },
  secundario: { backgroundColor: colores.menta },
  peligro: { backgroundColor: colores.blanco, borderWidth: 2, borderColor: colores.errorTexto },
  pulsado: { opacity: 0.85 },
  texto: { fontFamily: fuentes.extra, fontSize: 18 },
});
