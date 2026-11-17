import express from "express";
import { ContenidoRepositorio } from "./contenido-repositorio.js";
import { crearTablas } from "./esquema.js";

// Solo rutas GET: el servidor no recibe datos (R11F02T01).
// Por eso no hay app.post ni express.json().
const app = express();
const repositorio = new ContenidoRepositorio();

// Render pone su puerto en PORT.
const PUERTO = Number(process.env.PORT ?? 3000);

// Responde sin tocar la base de datos (R08F03).
app.get("/api/v1/health", (peticion, respuesta) => {
  respuesta.json({ estado: "ok" });
});

// R08F02T01
app.get("/api/v1/sync/version", async (peticion, respuesta) => {
  respuesta.json({ version: await repositorio.versionActual() });
});

app.get("/api/v1/sync/contenido", async (peticion, respuesta) => {
  respuesta.json(await repositorio.contenido());
});

// Crea las tablas si no existen.
await crearTablas();

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
