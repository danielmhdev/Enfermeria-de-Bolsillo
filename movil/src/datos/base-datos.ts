import { type SQLiteDatabase } from "expo-sqlite";
import { cancelarTodasLasAlertas } from "./alertas";
import { cargarContenidoInicial } from "./carga-inicial";
import { crearTablas } from "./esquema";
import { TareaRepositorio } from "./tarea-repositorio";

export async function iniciarBaseDatos(db: SQLiteDatabase): Promise<void> {
  await crearTablas(db);

  await cargarContenidoInicial(db);

  // Tareas y alertas de un turno ya pasado (R06F03T02).
  const borradas = await new TareaRepositorio(db).borrarSiCaducadas();
  if (borradas) {
    await cancelarTodasLasAlertas();
  }
}
