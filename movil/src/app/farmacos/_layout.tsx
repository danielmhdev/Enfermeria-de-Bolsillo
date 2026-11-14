import Stack from "expo-router/stack";

// Pila de pantallas de la pestaña Fármacos: la lista y, encima, el detalle.
export default function FarmacosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Fármacos" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
