import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { ContenidoRepositorio } from "./contenido-repositorio.js";
import { crearTablas } from "./tablas.js";

// Solo rutas GET: el servidor no recibe datos (R11F02T01).
// Por eso no hay app.post ni express.json().
const app = express();
const repositorio = new ContenidoRepositorio();

// La IP real del móvil llega en X-Forwarded-For. Delante hay tres saltos:
// Cloudflare y dos proxies internos de Render.
// Comprobado el 17/11/2026 con una ruta temporal que devolvía la IP.
app.set("trust proxy", 3);

// Cabeceras de seguridad (R11F01T01). También quita x-powered-by.
app.use(helmet());

// Como mucho 100 peticiones cada 15 minutos por IP (R11F01T01).
// La app hace 1 o 2 cada vez que se abre.
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use("/api/v1/sync", limitador);
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
