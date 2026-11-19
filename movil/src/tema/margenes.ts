import { useSafeAreaInsets } from "react-native-safe-area-context";

// Espacio de abajo: el hueco de la barra de inicio del iPhone o, si no la hay, 12.
// Lo usan el Pie y las pantallas sin Pie.
export function useMargenInferior(): number {
  return Math.max(useSafeAreaInsets().bottom, 12);
}
