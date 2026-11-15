import { type SQLiteDatabase } from "expo-sqlite";
import { Escala, type DefinicionEscala } from "@/dominio/escala";

// Fila de la tabla escala. La definición llega como texto JSON.
type FilaEscala = { codigo: string; nombre: string; definicion: string };

// Acceso de solo lectura a las escalas guardadas en SQLite (R01F02T01).
export class EscalaRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // Devuelve todas las escalas por orden alfabético.
  async todas(): Promise<Escala[]> {
    const filas = await this.db.getAllAsync<FilaEscala>(
      "SELECT codigo, nombre, definicion FROM escala ORDER BY nombre"
    );
    return filas.map((fila) => this.crear(fila));
  }

  // Devuelve una escala por su código, o null si no existe.
  async porCodigo(codigo: string): Promise<Escala | null> {
    const fila = await this.db.getFirstAsync<FilaEscala>(
      "SELECT codigo, nombre, definicion FROM escala WHERE codigo = ?",
      codigo
    );
    return fila === null ? null : this.crear(fila);
  }

  // Convierte una fila en un objeto Escala. JSON.parse pasa el texto a objeto.
  private crear(fila: FilaEscala): Escala {
    return new Escala(
      fila.codigo,
      fila.nombre,
      JSON.parse(fila.definicion) as DefinicionEscala
    );
  }
}
