import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colores } from "@/tema/colores";
import { useMargenInferior } from "@/tema/margenes";

type Props = {
  children: ReactNode;
  menta?: boolean;
};

// Barra fija de abajo para la acción principal, al alcance del pulgar (R10F01).
export function Pie({ children, menta = false }: Props) {
  // Espacio de la barra de inicio del iPhone.
  const margenInferior = useMargenInferior();
  return (
    <View style={[styles.pie, menta && styles.menta, { paddingBottom: margenInferior }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // flexShrink: si no cabe (por ejemplo con el teclado abierto), se encoge.
  pie: { flexShrink: 1, paddingTop: 12, paddingHorizontal: 16, gap: 10, backgroundColor: colores.blanco },
  menta: { backgroundColor: colores.menta, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
});
