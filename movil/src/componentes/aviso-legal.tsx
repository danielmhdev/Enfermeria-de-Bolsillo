import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colores } from "@/tema/colores";

type Props = {
  alAceptar: () => void;
};

// Aviso del primer inicio: hay que aceptarlo para entrar en la app (R11F03T01).
export function AvisoLegal({ alAceptar }: Props) {
  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.titulo}>Aviso legal</Text>
      <Text style={styles.texto}>
        Enfermería de Bolsillo es una herramienta de apoyo. No sustituye el juicio clínico, la
        prescripción médica ni los protocolos de tu centro.
      </Text>
      <Text style={styles.texto}>Comprueba siempre los resultados antes de aplicarlos.</Text>
      <Text style={styles.texto}>No introduzcas datos de pacientes.</Text>

      <Pressable style={styles.boton} onPress={alAceptar}>
        <Text style={styles.botonTexto}>Acepto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { padding: 16, gap: 12 },
  titulo: { color: colores.texto, fontSize: 26, fontWeight: "700", marginVertical: 16 },
  texto: { color: colores.texto, fontSize: 16 },
  boton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: colores.primario,
  },
  botonTexto: { color: colores.texto, fontSize: 16, fontWeight: "600" },
});
