import { Image, ScrollView, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Boton } from "@/componentes/boton";
import { Pie } from "@/componentes/pie";
import { Texto } from "@/componentes/texto";
import { colores } from "@/tema/colores";

const PUNTOS: { icono: keyof typeof Ionicons.glyphMap; texto: string }[] = [
  {
    icono: "information-circle-outline",
    texto:
      "Enfermería de Bolsillo es una herramienta de apoyo. No sustituye el juicio clínico, la prescripción médica ni los protocolos de tu centro.",
  },
  { icono: "checkmark-circle-outline", texto: "Comprueba siempre los resultados antes de aplicarlos." },
  { icono: "shield-checkmark-outline", texto: "No introduzcas datos de pacientes." },
];

type Props = {
  alAceptar: () => void;
};

// Aviso del primer inicio (R11F03T01).
export function AvisoLegal({ alAceptar }: Props) {
  const margenes = useSafeAreaInsets();
  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={[styles.contenedor, { paddingTop: margenes.top + 16 }]}>
        <View style={styles.cabecera}>
          <Image
            style={styles.logo}
            source={require("@/assets/images/logo.png")}
            resizeMode="contain"
            accessibilityLabel="Enfermería de Bolsillo"
          />
          <Texto variante="titulo" accessibilityRole="header">
            Aviso legal
          </Texto>
        </View>

        {PUNTOS.map((punto) => (
          <View key={punto.icono} style={styles.punto}>
            <View style={styles.icono}>
              <Ionicons name={punto.icono} size={22} color={colores.acento} />
            </View>
            <Texto style={styles.textoPunto}>{punto.texto}</Texto>
          </View>
        ))}
      </ScrollView>

      <Pie>
        <Boton texto="Acepto" alPulsar={alAceptar} />
      </Pie>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  cabecera: { paddingHorizontal: 8, marginBottom: 8, gap: 12 },
  // Misma proporción que la imagen (892 x 461).
  logo: { height: 48, width: undefined, aspectRatio: 892 / 461, alignSelf: "flex-start" },
  punto: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 14,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 24,
    backgroundColor: colores.menta,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  textoPunto: { flex: 1, paddingTop: 8 },
});
