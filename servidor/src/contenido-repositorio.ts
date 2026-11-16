import { db } from "./base-datos.js";

// Único acceso del servidor a PostgreSQL.
export class ContenidoRepositorio {
  // Versión publicada: el numero más alto, o 0 si aún no se ha publicado nada.
  async versionActual(): Promise<number> {
    const resultado = await db.query(
      "SELECT COALESCE(MAX(numero), 0) AS numero FROM version"
    );
    return resultado.rows[0].numero;
  }

  // Todo el contenido, con la misma forma que los ficheros JSON de la app.
  async contenido() {
    const farmacos = await db.query("SELECT id, nombre FROM farmaco ORDER BY id");
    // AS renombra las columnas al nombre que llevan en el JSON.
    const rangos = await db.query(`
      SELECT farmaco_id, via, indicacion, tipo,
        dosis_min AS "dosisMin", dosis_max AS "dosisMax",
        intervalo_h AS "intervaloH", max_diario AS "maxDiario",
        peso_min_kg AS "pesoMinKg", peso_max_kg AS "pesoMaxKg",
        nota, fuente, fuente_url AS "fuenteUrl"
      FROM rango_dosis ORDER BY id`);
    const escalas = await db.query(
      "SELECT codigo, nombre, definicion FROM escala ORDER BY codigo"
    );
    const guias = await db.query("SELECT codigo, nombre, arbol FROM guia ORDER BY codigo");

    return {
      version: await this.versionActual(),
      // A cada fármaco se le añaden sus rangos, sin la clave ajena.
      farmacos: farmacos.rows.map((farmaco) => ({
        nombre: farmaco.nombre,
        rangos: rangos.rows
          .filter((rango) => rango.farmaco_id === farmaco.id)
          .map(({ farmaco_id, ...rango }) => rango),
      })),
      escalas: escalas.rows,
      guias: guias.rows,
    };
  }
}
