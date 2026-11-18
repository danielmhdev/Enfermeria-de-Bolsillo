import escalas from "./contenido/escalas.json";
import farmacos from "./contenido/farmacos.json";
import guias from "./contenido/guias.json";
import { EsquemaContenido, EsquemaGuia, EsquemaRespuestaContenido } from "./validacion";

test("el contenido que lleva la app es válido", () => {
  const resultado = EsquemaContenido.safeParse({ farmacos, escalas, guias });
  expect(resultado.success).toBe(true);
});

test("una escala con un ítem sin opciones se rechaza", () => {
  const escala = {
    ...escalas[0],
    definicion: { ...escalas[0].definicion, items: [{ id: "a", texto: "Ítem", opciones: [] }] },
  };
  const resultado = EsquemaContenido.safeParse({ farmacos, escalas: [escala], guias: [] });
  expect(resultado.success).toBe(false);
});

test("una respuesta sin versión se rechaza", () => {
  const resultado = EsquemaRespuestaContenido.safeParse({ farmacos, escalas, guias: [] });
  expect(resultado.success).toBe(false);
});

describe("guías", () => {
  // Textos de relleno: no es contenido clínico.
  const pregunta = {
    id: "p1",
    tipo: "pregunta",
    texto: "¿Pregunta 1?",
    fuente: null,
    respuestas: [{ texto: "Sí", siguiente: "r1" }],
  };
  const recomendacion = {
    id: "r1",
    tipo: "recomendacion",
    texto: "Recomendación A",
    fuente: "Fuente",
    respuestas: [],
  };

  function guiaCon(nodos: object[]) {
    return { codigo: "prueba", nombre: "Guía de prueba", arbol: { inicio: "p1", nodos } };
  }

  test("un árbol bien enlazado se acepta", () => {
    expect(EsquemaGuia.safeParse(guiaCon([pregunta, recomendacion])).success).toBe(true);
  });

  test("una respuesta que lleva a un nodo que no existe se rechaza", () => {
    const rota = { ...pregunta, respuestas: [{ texto: "Sí", siguiente: "p9" }] };
    expect(EsquemaGuia.safeParse(guiaCon([rota, recomendacion])).success).toBe(false);
  });

  test("una pregunta sin respuestas se rechaza", () => {
    const sinRespuestas = { ...pregunta, respuestas: [] };
    expect(EsquemaGuia.safeParse(guiaCon([sinRespuestas, recomendacion])).success).toBe(false);
  });
});
