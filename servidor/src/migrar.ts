import { db } from "./base-datos.js";
import { crearTablas } from "./esquema.js";

// Crea las tablas si no existen y cierra la conexión (R08F01T01).
await crearTablas();
console.log("Tablas creadas.");
await db.end();
