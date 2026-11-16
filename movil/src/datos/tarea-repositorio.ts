import { type SQLiteDatabase } from "expo-sqlite";
import { Tarea, turnoCaducado, validarTexto, type Prioridad } from "@/dominio/tarea";

// Fila de la tabla tarea. SQLite no tiene booleanos ni fechas: usa 0/1 y texto.
type FilaTarea = {
  id: number;
  texto: string;
  prioridad: Prioridad;
  completada: number;
  hora_alerta: string | null;
  notificacion_id: string | null;
  creada_en: string;
};

// Lectura y escritura de las tareas del turno en SQLite (R06F01T01).
export class TareaRepositorio {
  private readonly db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // Pendientes primero y, dentro de cada grupo, las de prioridad alta.
  // "alta" va antes que "normal" por orden alfabético.
  async todas(): Promise<Tarea[]> {
    const filas = await this.db.getAllAsync<FilaTarea>(
      "SELECT * FROM tarea ORDER BY completada, prioridad, id"
    );
    return filas.map(
      (f) =>
        new Tarea(
          f.id,
          f.texto,
          f.prioridad,
          f.completada === 1,
          f.hora_alerta === null ? null : new Date(f.hora_alerta),
          f.notificacion_id,
          new Date(f.creada_en)
        )
    );
  }

  // Guarda una tarea nueva. validarTexto lanza un error si el texto no vale.
  // horaAlerta y notificacionId son null si la tarea no lleva alerta.
  async crear(
    texto: string,
    prioridad: Prioridad,
    horaAlerta: Date | null,
    notificacionId: string | null
  ): Promise<void> {
    await this.db.runAsync(
      "INSERT INTO tarea (texto, prioridad, hora_alerta, notificacion_id, creada_en) VALUES (?, ?, ?, ?, ?)",
      validarTexto(texto),
      prioridad,
      horaAlerta === null ? null : horaAlerta.toISOString(),
      notificacionId,
      new Date().toISOString()
    );
  }

  // Marca o desmarca una tarea como completada.
  async marcar(id: number, completada: boolean): Promise<void> {
    await this.db.runAsync(
      "UPDATE tarea SET completada = ? WHERE id = ?",
      completada ? 1 : 0,
      id
    );
  }

  // Borra todas las tareas. Lo usa «Terminar turno» (R06F03T01).
  async borrarTodas(): Promise<void> {
    await this.db.runAsync("DELETE FROM tarea");
  }

  // Borra las tareas si la más antigua tiene 12 horas o más (R06F03T02).
  // Las fechas se guardan como texto ISO, así que MIN devuelve la más antigua.
  // Devuelve true si ha borrado, para cancelar también las alertas.
  async borrarSiCaducadas(): Promise<boolean> {
    const fila = await this.db.getFirstAsync<{ primera: string | null }>(
      "SELECT MIN(creada_en) AS primera FROM tarea"
    );
    // Si no hay tareas, MIN devuelve null y no hay nada que borrar.
    if (fila === null || fila.primera === null) {
      return false;
    }
    if (turnoCaducado(new Date(fila.primera), new Date())) {
      await this.borrarTodas();
      return true;
    }
    return false;
  }
}
