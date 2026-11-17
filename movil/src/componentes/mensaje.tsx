import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

type Tipo = "aviso" | "error" | "correcto";

const ESTILO = {
  aviso: { fondo: colores.avisoFondo, texto: colores.avisoTexto, icono: "warning-outline" },
  error: { fondo: colores.errorFondo, texto: colores.errorTexto, icono: "alert-circle-outline" },
  correcto: { fondo: colores.correctoFondo, texto: colores.correctoTexto, icono: "checkmark-circle-outline" },
} as const;

type Props = {
  tipo: Tipo;
  titulo?: string;
  children: ReactNode;
};

// Cada mensaje lleva icono y título además del color.
export function Mensaje({ tipo, titulo, children }: Props) {
  const estilo = ESTILO[tipo];
  return (
    <View
      accessibilityRole={tipo === "correcto" ? undefined : "alert"}
      style={[styles.mensaje, { backgroundColor: estilo.fondo }]}
    >
      <View style={styles.icono}>
        <Ionicons name={estilo.icono} size={22} color={estilo.texto} />
      </View>
      <View style={styles.contenido}>
        {titulo !== undefined && <Text style={[styles.titulo, { color: estilo.texto }]}>{titulo}</Text>}
        <Text style={[styles.texto, { color: estilo.texto }]}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mensaje: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 24 },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  contenido: { flex: 1, gap: 2 },
  titulo: { fontFamily: fuentes.extra, fontSize: 17, lineHeight: 23 },
  texto: { fontFamily: fuentes.normal, fontSize: 16, lineHeight: 23 },
});
