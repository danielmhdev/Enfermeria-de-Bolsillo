import { CalculadoraClinica } from "./calculadora-clinica";

// Pruebas de las fórmulas de la calculadora (R02).
describe("CalculadoraClinica", () => {
  // R02F01T01P01: dosis por peso.
  test("5 mg/kg con 70 kg da 350 mg", () => {
    expect(CalculadoraClinica.dosisPorPeso(70, 5)).toBe(350);
  });

  // R02F02T01P01: concentración de una dilución.
  test("500 mg en 250 ml da 2 mg/ml", () => {
    expect(CalculadoraClinica.concentracion(500, 250)).toBe(2);
  });

  // R02F03T01P01: ritmo de bomba.
  test("1.000 ml en 8 h da 125 ml/h", () => {
    expect(CalculadoraClinica.ritmoMlPorHora(1000, 8)).toBe(125);
  });

  // R02F03T01P01: ritmo de goteo. El resultado exacto es 41,67 y se redondea a 42.
  test("1.000 ml en 8 h con factor 20 da 42 gotas/min", () => {
    expect(CalculadoraClinica.ritmoGotasPorMin(1000, 8, 20)).toBe(42);
  });

  // R02F04T01P01: con datos incorrectos no se calcula, se lanza un error.
  test("un peso negativo da error", () => {
    expect(() => CalculadoraClinica.dosisPorPeso(-70, 5)).toThrow();
  });

  // R02F04T01P01: un tiempo 0 dividiría entre 0.
  test("un tiempo 0 da error", () => {
    expect(() => CalculadoraClinica.ritmoMlPorHora(1000, 0)).toThrow();
  });

  // Solo se aceptan los factores de goteo 20 y 60.
  test("un factor de goteo distinto de 20 o 60 da error", () => {
    expect(() => CalculadoraClinica.ritmoGotasPorMin(1000, 8, 15)).toThrow();
  });
});