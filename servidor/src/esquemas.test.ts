import assert from "node:assert";
import { test } from "node:test";
import { EsquemaFarmaco, EsquemaGuia } from "./esquemas.js";

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

test("un rango sin maxDiarioPorKg se acepta y queda en null", () => {
  const resultado = EsquemaFarmaco.safeParse({ nombre: "Prueba", rangos: [rangoValido] });
  assert.equal(resultado.success, true);
  assert.equal(resultado.data?.rangos[0].maxDiarioPorKg, null);
});

test("maxDiarioPorKg en un rango por kilo se rechaza", () => {
  const rango = { ...rangoValido, tipo: "por_kg", maxDiarioPorKg: 0.5 };
  const resultado = EsquemaFarmaco.safeParse({ nombre: "Prueba", rangos: [rango] });
  assert.equal(resultado.success, false);
});

// Textos de relleno: no es contenido clínico.
test("una guía con una respuesta que lleva a un nodo que no existe se rechaza", () => {
  const resultado = EsquemaGuia.safeParse({
    codigo: "prueba",
    nombre: "Guía de prueba",
    arbol: {
      inicio: "p1",
      nodos: [
        {
          id: "p1",
          tipo: "pregunta",
          texto: "¿Pregunta 1?",
          fuente: null,
          respuestas: [{ texto: "Sí", siguiente: "p9" }],
        },
      ],
    },
  });
  assert.equal(resultado.success, false);
});
