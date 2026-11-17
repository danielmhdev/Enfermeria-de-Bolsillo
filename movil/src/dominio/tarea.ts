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

  // Tiene alerta y su hora aún no ha llegado.
  alertaPendiente(ahora: Date): boolean {
    return this.horaAlerta !== null && this.horaAlerta > ahora;
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

// «25 min», «1 h 40 min» o «2 h».
export function formatearEspera(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) {
    return `${resto} min`;
  }
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

// La próxima vez que el reloj marque esa hora: hoy si aún no ha pasado; si no, mañana.
export function proximaHora(hora: number, minuto: number, ahora: Date): Date {
  if (
    !Number.isInteger(hora) ||
    hora < 0 ||
    hora > 23 ||
    !Number.isInteger(minuto) ||
    minuto < 0 ||
    minuto > 59
  ) {
    throw new Error("Escribe una hora válida, de 00:00 a 23:59.");
  }
  const fecha = new Date(ahora);
  fecha.setHours(hora, minuto, 0, 0);
  if (fecha <= ahora) {
    fecha.setDate(fecha.getDate() + 1);
  }
  return fecha;
}

// La tarea pendiente cuya alerta llega antes; null si ninguna tiene alerta pendiente.
export function proximaAlerta(tareas: Tarea[], ahora: Date): Tarea | null {
  let proxima: Tarea | null = null;
  for (const tarea of tareas) {
    if (tarea.completada || !tarea.alertaPendiente(ahora)) {
      continue;
    }
    if (proxima === null || tarea.horaAlerta! < proxima.horaAlerta!) {
      proxima = tarea;
    }
  }
  return proxima;
}

// 12 horas o más desde la primera tarea (R06F03T02).
export function turnoCaducado(primeraTarea: Date, ahora: Date): boolean {
  const milisegundos = ahora.getTime() - primeraTarea.getTime();
  const horas = milisegundos / (1000 * 60 * 60);
  return horas >= HORAS_TURNO;
}
