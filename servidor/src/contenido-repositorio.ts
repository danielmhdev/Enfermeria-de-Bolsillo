import { db } from "./base-datos.js";
import { type Contenido } from "./esquemas.js";
import { normalizar } from "./texto.js";

// Único acceso del servidor a PostgreSQL.
export class ContenidoRepositorio {
  // 0 si aún no se ha publicado nada.
  async versionActual(): Promise<number> {
    const resultado = await db.query(
      "SELECT COALESCE(MAX(numero), 0) AS numero FROM version"
    );
    return resultado.rows[0].numero;
  }

  // Misma forma que los ficheros JSON de la app.
  async contenido() {
    const farmacos = await db.query("SELECT id, nombre FROM farmaco ORDER BY id");
    // AS renombra las columnas al nombre que llevan en el JSON.
    const rangos = await db.query(`
      SELECT farmaco_id, via, indicacion, tipo,
        dosis_min AS "dosisMin", dosis_max AS "dosisMax",
        intervalo_h AS "intervaloH", max_diario AS "maxDiario",
        max_diario_por_kg AS "maxDiarioPorKg",
        peso_min_kg AS "pesoMinKg", peso_max_kg AS "pesoMaxKg",
        nota, fuente, fuente_url AS "fuenteUrl"
      FROM rango_dosis ORDER BY id`);
    const escalas = await db.query(
      "SELECT codigo, nombre, definicion FROM escala ORDER BY codigo"
    );
    const guias = await db.query("SELECT codigo, nombre, arbol FROM guia ORDER BY codigo");

    return {
      version: await this.versionActual(),
      // Cada fármaco con sus rangos, sin la clave ajena.
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

  // Sustituye todo el contenido y sube la versión (R09F03T01).
  async reemplazar(contenido: Contenido): Promise<number> {
    // La transacción tiene que ir entera por la misma conexión.
    const cliente = await db.connect();
    try {
      await cliente.query("BEGIN");

      // Los rangos se borran solos (ON DELETE CASCADE).
      await cliente.query("DELETE FROM farmaco");
      await cliente.query("DELETE FROM escala");
      await cliente.query("DELETE FROM guia");

      let farmacoId = 0;
      let rangoId = 0;
      for (const farmaco of contenido.farmacos) {
        farmacoId++;
        await cliente.query(
          "INSERT INTO farmaco (id, nombre, nombre_busqueda) VALUES ($1, $2, $3)",
          [farmacoId, farmaco.nombre, normalizar(farmaco.nombre)]
        );
        for (const rango of farmaco.rangos) {
          rangoId++;
          // Con los nombres de las columnas: no depende de su orden en la tabla.
          await cliente.query(
            `INSERT INTO rango_dosis (id, farmaco_id, via, indicacion, tipo, dosis_min, dosis_max,
               intervalo_h, max_diario, max_diario_por_kg, peso_min_kg, peso_max_kg, nota, fuente, fuente_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              rangoId,
              farmacoId,
              rango.via,
              rango.indicacion,
              rango.tipo,
              rango.dosisMin,
              rango.dosisMax,
              rango.intervaloH,
              rango.maxDiario,
              rango.maxDiarioPorKg,
              rango.pesoMinKg,
              rango.pesoMaxKg,
              rango.nota,
              rango.fuente,
              rango.fuenteUrl,
            ]
          );
        }
      }

      for (const escala of contenido.escalas) {
        await cliente.query("INSERT INTO escala VALUES ($1, $2, $3)", [
          escala.codigo,
          escala.nombre,
          JSON.stringify(escala.definicion),
        ]);
      }

      for (const guia of contenido.guias) {
        await cliente.query("INSERT INTO guia VALUES ($1, $2, $3)", [
          guia.codigo,
          guia.nombre,
          JSON.stringify(guia.arbol),
        ]);
      }

      const resultado = await cliente.query(
        "INSERT INTO version (numero) SELECT COALESCE(MAX(numero), 0) + 1 FROM version RETURNING numero"
      );

      await cliente.query("COMMIT");
      return resultado.rows[0].numero;
    } catch (error) {
      await cliente.query("ROLLBACK");
      throw error;
    } finally {
      cliente.release();
    }
  }
}
