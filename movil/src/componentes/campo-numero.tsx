import { StyleSheet, Text, TextInput, View } from "react-native";
import { colores } from "@/tema/colores";

// Datos que recibe el componente desde la pantalla que lo usa.
type Props = {
  etiqueta: string;
  unidad: string;
  valor: string;
  alCambiar: (texto: string) => void;
};

// Campo para escribir un número, con su etiqueta y su unidad.
export function CampoNumero({ etiqueta, unidad, valor, alCambiar }: Props) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>
        {etiqueta} ({unidad})
      </Text>
      <TextInput
        style={styles.entrada}
        value={valor}
        onChangeText={alCambiar}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colores.textoSecundario}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    gap: 4,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  entrada: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: 18,
  },
});