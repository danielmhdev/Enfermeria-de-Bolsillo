import { type SQLiteDatabase } from "expo-sqlite";
import { cargarContenidoInicial } from "./carga-inicial";
import { crearTablas } from "./esquema";

export async function iniciarBaseDatos(db: SQLiteDatabase): Promise<void> {
  await crearTablas(db);

  await cargarContenidoInicial(db);
}