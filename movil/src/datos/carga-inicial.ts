import { type SQLiteDatabase } from "expo-sqlite";
import { AjusteRepositorio } from "./ajuste-repositorio";
import { ContenidoRepositorio, type EscalaJson, type FarmacoJson } from "./contenido-repositorio";
import escalasJson from "./contenido/escalas.json";
import farmacosJson from "./contenido/farmacos.json";

// Versión del contenido que va dentro de la app.
const VERSION_INICIAL = 1;

// Solo la primera vez que se abre la app (R01F01T02).
export async function cargarContenidoInicial(db: SQLiteDatabase): Promise<void> {
  if ((await new AjusteRepositorio(db).leer("version_contenido")) !== null) {
    return;
  }
  const contenido = {
    farmacos: farmacosJson as FarmacoJson[],
    escalas: escalasJson as EscalaJson[],
    guias: [],
  };
  await new ContenidoRepositorio(db).reemplazar(contenido, VERSION_INICIAL);
}
