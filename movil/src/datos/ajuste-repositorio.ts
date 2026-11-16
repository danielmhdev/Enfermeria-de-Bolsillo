import { type SQLiteDatabase } from "expo-sqlite";

// Ajustes de la app guardados como pares clave y valor.
export class AjusteRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // Devuelve el valor de una clave, o null si todavía no se ha guardado.
  async leer(clave: string): Promise<string | null> {
    const fila = await this.db.getFirstAsync<{ valor: string }>(
      "SELECT valor FROM ajuste WHERE clave = ?",
      clave
    );
    return fila === null ? null : fila.valor;
  }

  // Guarda el valor; si la clave ya existía, lo sustituye.
  async guardar(clave: string, valor: string): Promise<void> {
    await this.db.runAsync(
      "INSERT OR REPLACE INTO ajuste (clave, valor) VALUES (?, ?)",
      clave,
      valor
    );
  }
}
