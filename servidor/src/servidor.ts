import express from "express";
import { ContenidoRepositorio } from "./contenido-repositorio.js";

// Solo hay rutas GET: el servidor reparte contenido y no recibe datos (R11F02T01).
// Por eso no hay app.post ni se activa express.json().
const app = express();
const repositorio = new ContenidoRepositorio();

// Puerto en el que escucha. Render pone el suyo en la variable PORT.
const PUERTO = Number(process.env.PORT ?? 3000);

// Ruta de salud: responde sin tocar la base de datos (R08F03).
app.get("/api/v1/health", (peticion, respuesta) => {
  respuesta.json({ estado: "ok" });
});

// Versión publicada. La app la compara con la suya (R08F02T01).
app.get("/api/v1/sync/version", async (peticion, respuesta) => {
  respuesta.json({ version: await repositorio.versionActual() });
});

// Contenido completo de la versión publicada (R08F02T01).
app.get("/api/v1/sync/contenido", async (peticion, respuesta) => {
  respuesta.json(await repositorio.contenido());
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
