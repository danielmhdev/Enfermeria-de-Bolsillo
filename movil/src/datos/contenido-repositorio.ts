import { type SQLiteDatabase } from "expo-sqlite";
import { normalizar } from "@/dominio/texto";
import { AjusteRepositorio } from "./ajuste-repositorio";

// Misma forma que los JSON de contenido y que /sync/contenido.
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

export type FarmacoJson = { nombre: string; rangos: RangoJson[] };

export type EscalaJson = { codigo: string; nombre: string; definicion: object };

type GuiaJson = { codigo: string; nombre: string; arbol: object };

export type Contenido = { farmacos: FarmacoJson[]; escalas: EscalaJson[]; guias: GuiaJson[] };

export class ContenidoRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // En una transacción: si algo falla, se queda el contenido que había.
  async reemplazar(contenido: Contenido, version: number): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.execAsync(
        "DELETE FROM rango_dosis; DELETE FROM farmaco; DELETE FROM escala; DELETE FROM guia;"
      );

      for (const farmaco of contenido.farmacos) {
        const resultado = await this.db.runAsync(
          "INSERT INTO farmaco (nombre, nombre_busqueda) VALUES (?, ?)",
          farmaco.nombre,
          normalizar(farmaco.nombre)
        );
        // Los rangos necesitan el id del fármaco como clave ajena.
        const farmacoId = resultado.lastInsertRowId;

        for (const rango of farmaco.rangos) {
          await this.db.runAsync(
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

      for (const escala of contenido.escalas) {
        await this.db.runAsync(
          "INSERT INTO escala (codigo, nombre, definicion) VALUES (?, ?, ?)",
          escala.codigo,
          escala.nombre,
          JSON.stringify(escala.definicion)
        );
      }

      for (const guia of contenido.guias) {
        await this.db.runAsync(
          "INSERT INTO guia (codigo, nombre, arbol) VALUES (?, ?, ?)",
          guia.codigo,
          guia.nombre,
          JSON.stringify(guia.arbol)
        );
      }

      await new AjusteRepositorio(this.db).guardar("version_contenido", String(version));
    });
  }
}
