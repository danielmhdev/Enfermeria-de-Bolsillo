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
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    // Necesario para deslizar las tareas.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="enfermeria.db" onInit={iniciarBaseDatos}>
        {/* Cada pantalla dibuja su propia cabecera (Cabecera o el logo del Inicio). */}
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
