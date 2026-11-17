import { Guia } from "./guia";

// Textos de relleno: no es contenido clínico.
const guia = new Guia("prueba", "Guía de prueba", {
  inicio: "p1",
  nodos: [
    {
      id: "p1",
      tipo: "pregunta",
      texto: "¿Pregunta 1?",
      fuente: null,
      respuestas: [{ texto: "Sí", siguiente: "r1" }],
    },
    { id: "r1", tipo: "recomendacion", texto: "Recomendación A", fuente: "Fuente", respuestas: [] },
  ],
});

test("nodo devuelve el nodo pedido", () => {
  expect(guia.nodo("r1").texto).toBe("Recomendación A");
});

test("nodo da error si no existe", () => {
  expect(() => guia.nodo("p9")).toThrow();
});
