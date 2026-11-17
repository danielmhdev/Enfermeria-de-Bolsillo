import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colores } from "@/tema/colores";

type Props = {
  children: ReactNode;
  destacada?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Menta claro; destacada, menta fuerte.
export function Tarjeta({ children, destacada = false, style }: Props) {
  return <View style={[styles.tarjeta, destacada && styles.destacada, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  tarjeta: { padding: 18, gap: 10, borderRadius: 28, backgroundColor: colores.menta },
  destacada: { backgroundColor: colores.primario },
});
