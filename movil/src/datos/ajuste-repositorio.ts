import { type SQLiteDatabase } from "expo-sqlite";

// Ajustes de la app: pares clave y valor.
export class AjusteRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // null si la clave todavía no existe.
  async leer(clave: string): Promise<string | null> {
    const fila = await this.db.getFirstAsync<{ valor: string }>(
      "SELECT valor FROM ajuste WHERE clave = ?",
      clave
    );
    return fila === null ? null : fila.valor;
  }

  // Si la clave ya existía, la sustituye.
  async guardar(clave: string, valor: string): Promise<void> {
    await this.db.runAsync(
      "INSERT OR REPLACE INTO ajuste (clave, valor) VALUES (?, ?)",
      clave,
      valor
    );
  }
}
