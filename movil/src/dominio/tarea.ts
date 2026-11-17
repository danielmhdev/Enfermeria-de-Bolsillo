export type Prioridad = "alta" | "normal";

// La misma que el CHECK de la tabla tarea.
export const LONGITUD_MAXIMA = 120;

// Pasadas 12 horas las tareas se borran.
export const HORAS_TURNO = 12;

// Solo se guarda en el móvil y nunca lleva datos de pacientes.
export class Tarea {
  constructor(
    public readonly id: number,
    public readonly texto: string,
    public readonly prioridad: Prioridad,
    public readonly completada: boolean,
    public readonly horaAlerta: Date | null,
    public readonly notificacionId: string | null,
    public readonly creadaEn: Date
  ) {}

  tieneAlerta(): boolean {
    return this.horaAlerta !== null;
  }
}

// Devuelve el texto sin espacios sobrantes o lanza un error.
export function validarTexto(texto: string): string {
  const limpio = texto.trim();
  if (limpio === "") {
    throw new Error("Escribe el texto de la tarea.");
  }
  if (limpio.length > LONGITUD_MAXIMA) {
    throw new Error(`El texto no puede pasar de ${LONGITUD_MAXIMA} caracteres.`);
  }
  return limpio;
}

// 12 horas o más desde la primera tarea (R06F03T02).
export function turnoCaducado(primeraTarea: Date, ahora: Date): boolean {
  const milisegundos = ahora.getTime() - primeraTarea.getTime();
  const horas = milisegundos / (1000 * 60 * 60);
  return horas >= HORAS_TURNO;
}
