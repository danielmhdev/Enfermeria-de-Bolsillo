import Stack from "expo-router/stack";
import * as Notifications from "expo-notifications";
import { SQLiteProvider } from "expo-sqlite";
import { iniciarBaseDatos } from "@/datos/base-datos";

// Para que la alerta se vea también con la app abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Una sola pila: el menú y, encima, cada sección.
export default function Navegacion() {
  return (
    <SQLiteProvider databaseName="enfermeria.db" onInit={iniciarBaseDatos}>
      <Stack>
        {/* El menú no lleva cabecera: tiene su logo. */}
        <Stack.Screen name="index" options={{ title: "Inicio", headerShown: false }} />
        <Stack.Screen name="calculadora/index" options={{ title: "Calculadora" }} />
        <Stack.Screen name="farmacos/index" options={{ title: "Fármacos" }} />
        <Stack.Screen name="farmacos/[id]" options={{ title: "" }} />
        <Stack.Screen name="escalas/index" options={{ title: "Escalas" }} />
        <Stack.Screen name="escalas/[codigo]" options={{ title: "" }} />
        <Stack.Screen name="guia/index" options={{ title: "Guía de curas" }} />
        <Stack.Screen name="tareas/index" options={{ title: "Tareas" }} />
      </Stack>
    </SQLiteProvider>
  );
}
