import assert from "node:assert";
import { test } from "node:test";
import { EsquemaFarmaco } from "./esquemas.js";

const rangoValido = {
  via: "IV",
  indicacion: "Indicación de prueba",
  tipo: "fija",
  dosisMin: 500,
  dosisMax: 1000,
  intervaloH: 6,
  maxDiario: 4000,
  pesoMinKg: null,
  pesoMaxKg: null,
  nota: null,
  fuente: "Fuente de prueba",
  fuenteUrl: "https://example.com/ficha.pdf",
};

test("un fármaco válido se acepta", () => {
  const resultado = EsquemaFarmaco.safeParse({ nombre: "Prueba", rangos: [rangoValido] });
  assert.equal(resultado.success, true);
});

// R09F01T01P01
test("un fármaco sin nombre se rechaza", () => {
  const resultado = EsquemaFarmaco.safeParse({ nombre: "", rangos: [rangoValido] });
  assert.equal(resultado.success, false);
});

test("una vía que no existe se rechaza", () => {
  const rango = { ...rangoValido, via: "IB" };
  const resultado = EsquemaFarmaco.safeParse({ nombre: "Prueba", rangos: [rango] });
  assert.equal(resultado.success, false);
});

test("dosisMin mayor que dosisMax se rechaza", () => {
  const rango = { ...rangoValido, dosisMin: 2000 };
  const resultado = EsquemaFarmaco.safeParse({ nombre: "Prueba", rangos: [rango] });
  assert.equal(resultado.success, false);
});
