import { db } from "./base-datos.js";
import { crearTablas } from "./esquema.js";

// Crea las tablas (R08F01T01).
await crearTablas();
console.log("Tablas creadas.");
await db.end();
