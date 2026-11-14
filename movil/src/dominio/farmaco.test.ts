import { RangoDosis, type TipoDosis } from "./farmaco";

// Crea un rango de prueba; solo importan el tipo y los límites.
function rango(tipo: TipoDosis, min: number, max: number): RangoDosis {
  return new RangoDosis(
    1, "IV", "Prueba", tipo, min, max, null, null, null, null, null, "Fuente", "https://ejemplo.es"
  );
}

describe("RangoDosis", () => {
  // R03F02T01P01: una dosis superior al máximo está fuera de rango.
  test("2.000 mg con un rango fijo de 400 a 1.000 mg está fuera", () => {
    expect(rango("fija", 400, 1000).estaEnRango(2000, null)).toBe(false);
  });

  test("575 mg con un rango fijo de 400 a 1.000 mg está dentro", () => {
    expect(rango("fija", 400, 1000).estaEnRango(575, null)).toBe(true);
  });

  // Los extremos del rango cuentan como dentro.
  test("el máximo exacto está dentro", () => {
    expect(rango("fija", 400, 1000).estaEnRango(1000, null)).toBe(true);
  });

  test("una dosis inferior al mínimo está fuera", () => {
    expect(rango("fija", 400, 1000).estaEnRango(200, null)).toBe(false);
  });

  // Rango por kilo: 1 a 1,5 mg/kg con 80 kg son 80 a 120 mg.
  test("los límites de un rango por kilo se calculan con el peso", () => {
    expect(rango("por_kg", 1, 1.5).limitesMg(80)).toEqual({ min: 80, max: 120 });
  });

  test("150 mg con 1 a 1,5 mg/kg y 80 kg está fuera", () => {
    expect(rango("por_kg", 1, 1.5).estaEnRango(150, 80)).toBe(false);
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
