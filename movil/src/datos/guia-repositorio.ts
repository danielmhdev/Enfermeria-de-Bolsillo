import { type SQLiteDatabase } from "expo-sqlite";
import { Guia, type Arbol } from "@/dominio/guia";

type FilaGuia = { codigo: string; nombre: string; arbol: string };

// Guías de curas guardadas en SQLite (R05F01T01).
export class GuiaRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async todas(): Promise<Guia[]> {
    const filas = await this.db.getAllAsync<FilaGuia>(
      "SELECT codigo, nombre, arbol FROM guia ORDER BY nombre"
    );
    return filas.map((fila) => this.crear(fila));
  }

  // null si no existe.
  async porCodigo(codigo: string): Promise<Guia | null> {
    const fila = await this.db.getFirstAsync<FilaGuia>(
      "SELECT codigo, nombre, arbol FROM guia WHERE codigo = ?",
      codigo
    );
    return fila === null ? null : this.crear(fila);
  }

  // El árbol se guarda como texto JSON.
  private crear(fila: FilaGuia): Guia {
    return new Guia(fila.codigo, fila.nombre, JSON.parse(fila.arbol) as Arbol);
  }
}
