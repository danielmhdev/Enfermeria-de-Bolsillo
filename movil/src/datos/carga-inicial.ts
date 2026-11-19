import { type SQLiteDatabase } from "expo-sqlite";
import { AjusteRepositorio } from "./ajuste-repositorio";
import { ContenidoRepositorio } from "./contenido-repositorio";
import escalasJson from "./contenido/escalas.json";
import farmacosJson from "./contenido/farmacos.json";
import guiasJson from "./contenido/guias.json";
import { EsquemaContenido } from "./validacion";

// Versión del contenido que va dentro de la app.
const VERSION_INICIAL = 1;

// Solo la primera vez que se abre la app (R01F01T02).
export async function cargarContenidoInicial(db: SQLiteDatabase): Promise<void> {
  if ((await new AjusteRepositorio(db).leer("version_contenido")) !== null) {
    return;
  }
  // Se valida igual que el contenido que llega del servidor: así los campos
  // que faltan en el JSON toman su valor por defecto (maxDiarioPorKg = null).
  const contenido = EsquemaContenido.parse({
    farmacos: farmacosJson,
    escalas: escalasJson,
    guias: guiasJson,
  });
  await new ContenidoRepositorio(db).reemplazar(contenido, VERSION_INICIAL);
}
