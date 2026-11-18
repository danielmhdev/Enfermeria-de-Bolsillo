import { readFileSync } from "node:fs";
import { db } from "./base-datos.js";
import { ContenidoRepositorio } from "./contenido-repositorio.js";
import { EsquemaContenido } from "./validacion.js";

function leer(fichero: string): unknown {
  return JSON.parse(readFileSync(`contenido/${fichero}`, "utf8"));
}

// Valida los ficheros, los carga y sube la versión (R09F02T01).
const resultado = EsquemaContenido.safeParse({
  farmacos: leer("farmacos.json"),
  escalas: leer("escalas.json"),
  guias: leer("guias.json"),
});

if (!resultado.success) {
  console.error("El contenido no es válido. No se ha publicado nada:");
  for (const fallo of resultado.error.issues) {
    console.error(`- ${fallo.path.join(".")}: ${fallo.message}`);
  }
  process.exitCode = 1;
} else {
  try {
    const version = await new ContenidoRepositorio().reemplazar(resultado.data);
    console.log(`Publicada la versión ${version}.`);
  } catch (error) {
    // La transacción ya se ha deshecho.
    console.error("Error al guardar. No se ha publicado nada:");
    console.error(`- ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

await db.end();
