import { type SQLiteDatabase } from "expo-sqlite";
import { Farmaco, RangoDosis, type TipoDosis, type Via } from "@/dominio/farmaco";
import { normalizar } from "@/dominio/texto";

// Forma de las filas tal como salen de SQLite (nombres de columna con guion bajo).
type FilaFarmaco = { id: number; nombre: string };

type FilaRango = {
  id: number;
  via: Via;
  indicacion: string;
  tipo: TipoDosis;
  dosis_min: number;
  dosis_max: number;
  intervalo_h: number | null;
  max_diario: number | null;
  peso_min_kg: number | null;
  peso_max_kg: number | null;
  nota: string | null;
  fuente: string;
  fuente_url: string;
};

// Acceso de solo lectura a los fármacos guardados en SQLite (R01F02T01).
export class FarmacoRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // Busca fármacos cuyo nombre contenga el texto, sin distinguir tildes ni mayúsculas (R03F01T01).
  async buscar(texto: string): Promise<Farmaco[]> {
    const filas = await this.db.getAllAsync<FilaFarmaco>(
      "SELECT id, nombre FROM farmaco WHERE nombre_busqueda LIKE ? ORDER BY nombre",
      `%${normalizar(texto)}%`
    );

    const farmacos: Farmaco[] = [];
    for (const fila of filas) {
      const rangos = await this.rangosDe(fila.id);
      farmacos.push(new Farmaco(fila.id, fila.nombre, rangos));
    }
    return farmacos;
  }

  // Devuelve un fármaco por su id, o null si no existe.
  async porId(id: number): Promise<Farmaco | null> {
    const fila = await this.db.getFirstAsync<FilaFarmaco>(
      "SELECT id, nombre FROM farmaco WHERE id = ?",
      id
    );
    if (fila === null) {
      return null;
    }
    return new Farmaco(fila.id, fila.nombre, await this.rangosDe(fila.id));
  }

  // Lee los rangos de un fármaco y convierte cada fila en un objeto RangoDosis.
  private async rangosDe(farmacoId: number): Promise<RangoDosis[]> {
    const filas = await this.db.getAllAsync<FilaRango>(
      "SELECT * FROM rango_dosis WHERE farmaco_id = ? ORDER BY id",
      farmacoId
    );
    return filas.map(
      (f) =>
        new RangoDosis(
          f.id, f.via, f.indicacion, f.tipo, f.dosis_min, f.dosis_max,
          f.intervalo_h, f.max_diario, f.peso_min_kg, f.peso_max_kg,
          f.nota, f.fuente, f.fuente_url
        )
    );
  }
}
