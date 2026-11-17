import * as Notifications from "expo-notifications";

// Si el permiso ya está dado, no vuelve a preguntar.
export async function pedirPermiso(): Promise<boolean> {
  const permiso = await Notifications.requestPermissionsAsync();
  return permiso.granted;
}

// El texto es genérico: nunca lleva el de la tarea (R06F02T01).
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
