import {
  formatearEspera,
  LONGITUD_MAXIMA,
  proximaAlerta,
  Tarea,
  turnoCaducado,
  validarTexto,
} from "./tarea";

describe("validarTexto", () => {
  test("quita los espacios del principio y del final", () => {
    expect(validarTexto("  Curar la vía  ")).toBe("Curar la vía");
  });

  test("un texto vacío da error", () => {
    expect(() => validarTexto("   ")).toThrow();
  });

  test("un texto de 120 caracteres es válido", () => {
    expect(validarTexto("a".repeat(LONGITUD_MAXIMA))).toHaveLength(120);
  });

  test("un texto de 121 caracteres da error", () => {
    expect(() => validarTexto("a".repeat(LONGITUD_MAXIMA + 1))).toThrow();
  });
});

describe("turnoCaducado", () => {
  const primera = new Date("2026-11-15T08:00:00");

  test("a las 11 horas el turno sigue abierto", () => {
    expect(turnoCaducado(primera, new Date("2026-11-15T19:00:00"))).toBe(false);
  });

  test("a las 12 horas el turno ha caducado", () => {
    expect(turnoCaducado(primera, new Date("2026-11-15T20:00:00"))).toBe(true);
  });
});

describe("alertaPendiente", () => {
  const ahora = new Date("2026-11-15T10:00:00");

  function tareaConAlerta(hora: string) {
    return new Tarea(1, "Curar la vía", "normal", true, new Date(hora), null, ahora);
  }

  test("una alerta en el futuro está pendiente", () => {
    expect(tareaConAlerta("2026-11-15T10:30:00").alertaPendiente(ahora)).toBe(true);
  });

  test("una alerta que ya ha pasado no está pendiente", () => {
    expect(tareaConAlerta("2026-11-15T09:30:00").alertaPendiente(ahora)).toBe(false);
  });
});

describe("formatearEspera", () => {
  test("menos de una hora", () => {
    expect(formatearEspera(25)).toBe("25 min");
  });

  test("horas y minutos", () => {
    expect(formatearEspera(100)).toBe("1 h 40 min");
  });

  test("horas justas", () => {
    expect(formatearEspera(120)).toBe("2 h");
  });
});

describe("proximaAlerta", () => {
  const ahora = new Date("2026-11-15T10:00:00");

  function tarea(id: number, completada: boolean, hora: string | null) {
    return new Tarea(id, `Tarea ${id}`, "normal", completada, hora === null ? null : new Date(hora), null, ahora);
  }

  test("elige la alerta más cercana", () => {
    const tareas = [tarea(1, false, "2026-11-15T11:00:00"), tarea(2, false, "2026-11-15T10:30:00")];
    expect(proximaAlerta(tareas, ahora)?.id).toBe(2);
  });

  test("ignora las completadas, las ya pasadas y las que no tienen alerta", () => {
    const tareas = [
      tarea(1, true, "2026-11-15T10:10:00"),
      tarea(2, false, "2026-11-15T09:30:00"),
      tarea(3, false, null),
    ];
    expect(proximaAlerta(tareas, ahora)).toBeNull();
  });
});
