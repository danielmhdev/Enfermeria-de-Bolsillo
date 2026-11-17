import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores } from "@/tema/colores";

type Props = {
  children: ReactNode;
  menta?: boolean;
};

// Barra fija de abajo para la acción principal, al alcance del pulgar (R10F01).
export function Pie({ children, menta = false }: Props) {
  // Espacio de la barra de inicio del iPhone.
  const margenes = useSafeAreaInsets();
  return (
    <View style={[styles.pie, menta && styles.menta, { paddingBottom: margenes.bottom + 12 }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pie: { paddingTop: 12, paddingHorizontal: 16, gap: 10, backgroundColor: colores.blanco },
  menta: { backgroundColor: colores.menta, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
});
