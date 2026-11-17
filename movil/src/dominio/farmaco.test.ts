import { Farmaco, RangoDosis, type TipoDosis, type Via } from "./farmaco";

// Rango de prueba: solo importan el tipo y los límites.
function rango(tipo: TipoDosis, min: number, max: number): RangoDosis {
  return new RangoDosis(
    1, "IV", "Prueba", tipo, min, max, null, null, null, null, null, "Fuente", "https://ejemplo.es"
  );
}

describe("RangoDosis", () => {
  // 1 a 1,5 mg/kg con 80 kg son 80 a 120 mg.
  test("los límites de un rango por kilo se calculan con el peso", () => {
    expect(rango("por_kg", 1, 1.5).limitesMg(80)).toEqual({ min: 80, max: 120 });
  });

  // R03F02T01P01: el aviso salta con una dosis superior al máximo.
  test("2.000 mg supera un máximo de 1.000 mg", () => {
    expect(rango("fija", 400, 1000).superaMaximo(2000, null)).toBe(true);
  });

  // El máximo exacto y las dosis por debajo del mínimo no avisan.
  test("el máximo exacto no supera el máximo", () => {
    expect(rango("fija", 400, 1000).superaMaximo(1000, null)).toBe(false);
  });

  test("una dosis inferior al mínimo no supera el máximo", () => {
    expect(rango("fija", 400, 1000).superaMaximo(200, null)).toBe(false);
  });

  test("150 mg supera el máximo de 1,5 mg/kg con 80 kg", () => {
    expect(rango("por_kg", 1, 1.5).superaMaximo(150, 80)).toBe(true);
  });

  test("un rango por kilo sin peso da error", () => {
    expect(() => rango("por_kg", 1, 1.5).limitesMg(null)).toThrow();
  });
});

describe("correspondeAPeso", () => {
  // Rango de 33 a 50 kg, como el de paracetamol.
  const conLimites = new RangoDosis(
    1, "IV", "Prueba", "por_kg", 15, 15, null, null, 33, 50, null, "Fuente", "https://ejemplo.es"
  );

  test("sin límites de peso vale para cualquier peso", () => {
    expect(rango("fija", 400, 1000).correspondeAPeso(120)).toBe(true);
  });

  test("dentro de los límites, incluidos los extremos", () => {
    expect(conLimites.correspondeAPeso(45)).toBe(true);
    expect(conLimites.correspondeAPeso(50)).toBe(true);
  });

  test("fuera de los límites", () => {
    expect(conLimites.correspondeAPeso(30)).toBe(false);
    expect(conLimites.correspondeAPeso(60)).toBe(false);
  });
});

describe("tieneVia", () => {
  function rangoPorVia(via: Via): RangoDosis {
    return new RangoDosis(
      1, via, "Prueba", "fija", 1, 1, null, null, null, null, null, "Fuente", "https://ejemplo.es"
    );
  }

  test("un fármaco con rangos IV y SC tiene vía SC", () => {
    expect(new Farmaco(1, "Prueba", [rangoPorVia("IV"), rangoPorVia("SC")]).tieneVia("SC")).toBe(true);
  });

  test("un fármaco solo IV no tiene vía SC", () => {
    expect(new Farmaco(1, "Prueba", [rangoPorVia("IV")]).tieneVia("SC")).toBe(false);
  });
});

describe("textoPeso", () => {
  function conPeso(min: number | null, max: number | null): RangoDosis {
    return new RangoDosis(
      1, "IV", "Prueba", "fija", 1, 1, null, null, min, max, null, "Fuente", "https://ejemplo.es"
    );
  }

  test("con los dos límites", () => {
    expect(conPeso(33, 50).textoPeso()).toBe("33 a 50 kg");
  });

  test("solo con mínimo", () => {
    expect(conPeso(53, null).textoPeso()).toBe("53 kg o más");
  });

  test("sin límites", () => {
    expect(conPeso(null, null).textoPeso()).toBeNull();
  });
});
