import { StyleSheet, Text, type TextProps } from "react-native";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

type Variante = "titulo" | "subtitulo" | "seccion" | "cuerpo" | "etiqueta" | "nota";

// Los tamaños de texto del diseño, para no repetirlos en cada pantalla.
export function Texto({ variante = "cuerpo", style, ...resto }: TextProps & { variante?: Variante }) {
  return <Text style={[estilos[variante], style]} {...resto} />;
}

const estilos = StyleSheet.create({
  titulo: { fontFamily: fuentes.extra, fontSize: 32, lineHeight: 38, color: colores.texto },
  subtitulo: { fontFamily: fuentes.normal, fontSize: 17, lineHeight: 24, color: colores.textoSecundario },
  seccion: { fontFamily: fuentes.extra, fontSize: 20, lineHeight: 26, color: colores.texto },
  cuerpo: { fontFamily: fuentes.normal, fontSize: 17, lineHeight: 24, color: colores.texto },
  etiqueta: { fontFamily: fuentes.extra, fontSize: 16, lineHeight: 22, color: colores.texto },
  nota: { fontFamily: fuentes.normal, fontSize: 14, lineHeight: 20, color: colores.textoSecundario },
});
