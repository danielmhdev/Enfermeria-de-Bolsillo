import { useEffect } from "react";
import Stack from "expo-router/stack";
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
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

// La pantalla de carga sigue visible hasta que la fuente esté lista.
SplashScreen.preventAutoHideAsync();

// Una sola pila: el menú y, encima, cada sección.
export default function Navegacion() {
  const [cargadas] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold });

  useEffect(() => {
    if (cargadas) {
      SplashScreen.hideAsync();
    }
  }, [cargadas]);

  if (!cargadas) {
    return null;
  }

  return (
    <SQLiteProvider databaseName="enfermeria.db" onInit={iniciarBaseDatos}>
      <Stack>
        {/* El menú no lleva cabecera: tiene su logo. */}
        <Stack.Screen name="index" options={{ title: "Inicio", headerShown: false }} />
        <Stack.Screen name="calculadora/index" options={{ title: "Calculadora", headerShown: false }} />
        <Stack.Screen name="farmacos/index" options={{ title: "Fármacos", headerShown: false }} />
        <Stack.Screen name="farmacos/[id]" options={{ title: "", headerShown: false }} />
        <Stack.Screen name="escalas/index" options={{ title: "Escalas", headerShown: false }} />
        <Stack.Screen name="escalas/[codigo]" options={{ title: "", headerShown: false }} />
        <Stack.Screen name="guia/index" options={{ title: "Guía de curas", headerShown: false }} />
        <Stack.Screen name="guia/[codigo]" options={{ title: "", headerShown: false }} />
        <Stack.Screen name="tareas/index" options={{ title: "Tareas" }} />
      </Stack>
    </SQLiteProvider>
  );
}
