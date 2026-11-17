import { StyleSheet, Text, TextInput, View } from "react-native";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

type Props = {
  etiqueta: string;
  unidad: string;
  valor: string;
  alCambiar: (texto: string) => void;
};

// Campo numérico con su etiqueta encima y la unidad dentro.
export function CampoNumero({ etiqueta, unidad, valor, alCambiar }: Props) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.caja}>
        <TextInput
          style={styles.entrada}
          value={valor}
          onChangeText={alCambiar}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colores.textoSecundario}
          accessibilityLabel={`${etiqueta} en ${unidad}`}
        />
        <Text style={styles.unidad}>{unidad}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: 8 },
  etiqueta: { fontFamily: fuentes.extra, fontSize: 16, color: colores.texto },
  caja: {
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  entrada: { flex: 1, fontFamily: fuentes.extra, fontSize: 24, color: colores.texto },
  unidad: { fontFamily: fuentes.negrita, fontSize: 17, color: colores.textoSecundario },
});
