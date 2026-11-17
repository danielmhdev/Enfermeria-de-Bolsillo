import { type SQLiteDatabase } from "expo-sqlite";
import { normalizar } from "@/dominio/texto";
import escalasJson from "./contenido/escalas.json";
import farmacosJson from "./contenido/farmacos.json";

// Forma de los ficheros JSON de contenido.
type RangoJson = {
  via: string;
  indicacion: string;
  tipo: string;
  dosisMin: number;
  dosisMax: number;
  intervaloH: number | null;
  maxDiario: number | null;
  pesoMinKg: number | null;
  pesoMaxKg: number | null;
  nota: string | null;
  fuente: string;
  fuenteUrl: string;
};

type FarmacoJson = { nombre: string; rangos: RangoJson[] };

type EscalaJson = { codigo: string; nombre: string; definicion: object };

const farmacos = farmacosJson as FarmacoJson[];
const escalas = escalasJson as EscalaJson[];

// Versión del contenido que va dentro de la app.
const VERSION_INICIAL = 1;

// Carga el contenido inicial la primera vez que se abre la app (R01F01T02).
export async function cargarContenidoInicial(db: SQLiteDatabase): Promise<void> {
  // Si ya hay una versión guardada, no se repite.
  const fila = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM ajuste WHERE clave = 'version_contenido'"
  );
  if (fila !== null) {
    return;
  }

  // En una transacción: o se guarda todo o nada.
  await db.withTransactionAsync(async () => {
    for (const farmaco of farmacos) {
      const resultado = await db.runAsync(
        "INSERT INTO farmaco (nombre, nombre_busqueda) VALUES (?, ?)",
        farmaco.nombre,
        normalizar(farmaco.nombre)
      );
      // Los rangos necesitan el id del fármaco como clave ajena.
      const farmacoId = resultado.lastInsertRowId;

      for (const rango of farmaco.rangos) {
        await db.runAsync(
          `INSERT INTO rango_dosis (
            farmaco_id, via, indicacion, tipo, dosis_min, dosis_max,
            intervalo_h, max_diario, peso_min_kg, peso_max_kg,
            nota, fuente, fuente_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          farmacoId,
          rango.via,
          rango.indicacion,
          rango.tipo,
          rango.dosisMin,
          rango.dosisMax,
          rango.intervaloH,
          rango.maxDiario,
          rango.pesoMinKg,
          rango.pesoMaxKg,
          rango.nota,
          rango.fuente,
          rango.fuenteUrl
        );
      }
    }

    for (const escala of escalas) {
      await db.runAsync(
        "INSERT INTO escala (codigo, nombre, definicion) VALUES (?, ?, ?)",
        escala.codigo,
        escala.nombre,
        JSON.stringify(escala.definicion)
      );
    }

    await db.runAsync(
      "INSERT INTO ajuste (clave, valor) VALUES ('version_contenido', ?)",
      String(VERSION_INICIAL)
    );
  });
}
