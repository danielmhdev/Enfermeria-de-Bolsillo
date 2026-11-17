import { RangoDosis, type TipoDosis } from "./farmaco";

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
