import { LONGITUD_MAXIMA, Tarea, turnoCaducado, validarTexto } from "./tarea";

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
