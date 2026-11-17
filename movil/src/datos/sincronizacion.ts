import { type SQLiteDatabase } from "expo-sqlite";
import { AjusteRepositorio } from "./ajuste-repositorio";
import { ContenidoRepositorio, type Contenido } from "./contenido-repositorio";

const URL_API = process.env.EXPO_PUBLIC_API_URL;

// Sin red no se espera más de 5 segundos.
const ESPERA_MAXIMA_MS = 5000;

// null si no hay red, el servidor no responde o devuelve un error.
async function pedir<T>(ruta: string): Promise<T | null> {
  if (URL_API === undefined) {
    return null;
  }
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), ESPERA_MAXIMA_MS);
  try {
    const respuesta = await fetch(`${URL_API}${ruta}`, { signal: controlador.signal });
    return respuesta.ok ? await respuesta.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

export async function versionDelServidor(): Promise<number | null> {
  const datos = await pedir<{ version: number }>("/sync/version");
  return datos !== null && typeof datos.version === "number" ? datos.version : null;
}

// R07F01T01
export async function hayContenidoNuevo(db: SQLiteDatabase): Promise<boolean> {
  const local = Number((await new AjusteRepositorio(db).leer("version_contenido")) ?? 0);
  const servidor = await versionDelServidor();
  // El servidor manda: si su versión es distinta, se descarga.
  // 0 es que todavía no hay nada publicado.
  return servidor !== null && servidor > 0 && servidor !== local;
}

// R07F02T01. Devuelve true si ha actualizado.
export async function sincronizar(db: SQLiteDatabase): Promise<boolean> {
  if (!(await hayContenidoNuevo(db))) {
    return false;
  }
  const contenido = await pedir<Contenido & { version: number }>("/sync/contenido");
  if (contenido === null || typeof contenido.version !== "number") {
    return false;
  }
  try {
    await new ContenidoRepositorio(db).reemplazar(contenido, contenido.version);
    return true;
  } catch {
    return false;
  }
}
