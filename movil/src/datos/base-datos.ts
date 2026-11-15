import { type SQLiteDatabase } from "expo-sqlite";
import { cargarContenidoInicial } from "./carga-inicial";
import { crearTablas } from "./esquema";
import { TareaRepositorio } from "./tarea-repositorio";

export async function iniciarBaseDatos(db: SQLiteDatabase): Promise<void> {
  await crearTablas(db);

  await cargarContenidoInicial(db);

  // Al abrir la app se borran las tareas de un turno ya pasado (R06F03T02).
  await new TareaRepositorio(db).borrarSiCaducadas();
}
