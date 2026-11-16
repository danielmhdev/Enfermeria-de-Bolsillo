import * as Notifications from "expo-notifications";

// Pide permiso para enviar notificaciones. Si ya está dado, no vuelve a preguntar.
export async function pedirPermiso(): Promise<boolean> {
  const permiso = await Notifications.requestPermissionsAsync();
  return permiso.granted;
}

// Programa una alerta local y devuelve su identificador.
// El texto es genérico: nunca lleva el texto de la tarea (R06F02T01).
export async function programarAlerta(hora: Date): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Enfermería de Bolsillo",
      body: "Tienes una tarea pendiente.",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: hora },
  });
}

export async function cancelarAlerta(notificacionId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificacionId);
}

export async function cancelarTodasLasAlertas(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
