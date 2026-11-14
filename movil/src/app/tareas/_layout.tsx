import Stack from "expo-router/stack";

// Pila de pantallas de la pestaña: da la cabecera con el título.
export default function TareasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Tareas" }} />
    </Stack>
  );
}
