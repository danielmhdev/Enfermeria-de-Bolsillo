import express from "express";

const app = express();

// Puerto en el que escucha. Render pone el suyo en la variable PORT.
const PUERTO = Number(process.env.PORT ?? 3000);

// Ruta de salud: responde sin tocar la base de datos (R08F03).
app.get("/api/v1/health", (peticion, respuesta) => {
  respuesta.json({ estado: "ok" });
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
