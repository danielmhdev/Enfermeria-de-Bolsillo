import { type SQLiteDatabase } from "expo-sqlite";
import { cancelarTodasLasAlertas } from "./alertas";
import { cargarContenidoInicial } from "./carga-inicial";
import { crearTablas } from "./tablas";
import { TareaRepositorio } from "./tarea-repositorio";

export async function iniciarBaseDatos(db: SQLiteDatabase): Promise<void> {
  await crearTablas(db);

  await cargarContenidoInicial(db);

  await limpiarTurnoCaducado(db);
}

// Tareas y alertas de un turno ya pasado (R06F03T02).
export async function limpiarTurnoCaducado(db: SQLiteDatabase): Promise<void> {
  if (await new TareaRepositorio(db).borrarSiCaducadas()) {
    await cancelarTodasLasAlertas();
  }
}
