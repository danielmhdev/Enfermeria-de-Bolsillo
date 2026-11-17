import escalasJson from "../datos/contenido/escalas.json";
import { Escala, type DefinicionEscala, type Respuestas } from "./escala";

function escala(codigo: string): Escala {
  const dato = escalasJson.find((e) => e.codigo === codigo)!;
  return new Escala(dato.codigo, dato.nombre, dato.definicion as DefinicionEscala);
}

// Responde cada ítem con la opción que vale esos puntos, en orden.
function responder(e: Escala, puntos: number[], variante: string | null = null): Respuestas {
  const respuestas: Respuestas = {};
  puntos.forEach((valor, i) => {
    const item = e.definicion.items[i];
    respuestas[item.id] = e.opcionesDe(item, variante).find((o) => o.puntos === valor)!;
  });
  return respuestas;
}

describe("Escala", () => {
  // R04F01T01P01: Glasgow 4-5-6 da 15.
  test("Glasgow 4-5-6 suma 15", () => {
    const glasgow = escala("glasgow");
    expect(glasgow.total(responder(glasgow, [4, 5, 6]))).toBe(15);
  });

  test("Glasgow 15 se interpreta con el tramo de 13 a 15", () => {
    const glasgow = escala("glasgow");
    expect(glasgow.interpretar(15)).toBe(glasgow.definicion.interpretacion[2].texto);
  });

  // R04F02T01P01: Braden tiene 6 ítems y da un nivel de riesgo.
  test("Braden tiene 6 ítems y 6 puntos es riesgo alto", () => {
    const braden = escala("braden");
    expect(braden.definicion.items).toHaveLength(6);
    const total = braden.total(responder(braden, [1, 1, 1, 1, 1, 1]));
    expect(total).toBe(6);
    expect(braden.interpretar(total!)).toBe("Riesgo alto de úlceras por presión");
  });

  // R04F02T01P02: con un parámetro sin responder no hay total.
  test("NEWS2 con un ítem sin responder no da total", () => {
    const news2 = escala("news2");
    // Solo se responden los 6 primeros ítems de los 7.
    expect(news2.total(responder(news2, [0, 0, 0, 0, 0, 0], "1"))).toBeNull();
  });

  // R04F01T02P01: un solo parámetro con 3 puntos activa el aviso.
  test("NEWS2 con un parámetro de 3 puntos da aviso", () => {
    const news2 = escala("news2");
    expect(news2.parametroRojo(responder(news2, [3, 0, 0, 0, 0, 0, 0], "1"))).toBe(true);
  });

  test("NEWS2 sin ningún parámetro de 3 puntos no da aviso", () => {
    const news2 = escala("news2");
    expect(news2.parametroRojo(responder(news2, [0, 0, 0, 0, 0, 0, 0], "1"))).toBe(false);
  });

  // R04F02T02P01: la escala 2 de SpO2 tiene opciones distintas de la escala 1.
  test("las opciones de SpO2 cambian con la escala 2", () => {
    const news2 = escala("news2");
    const spo2 = news2.definicion.items.find((item) => item.id === "spo2")!;
    expect(news2.opcionesDe(spo2, "2")).not.toEqual(news2.opcionesDe(spo2, "1"));
  });
});

describe("rangoPuntos", () => {
  test("Glasgow va de 3 a 15", () => {
    expect(escala("glasgow").rangoPuntos()).toEqual({ min: 3, max: 15 });
  });

  test("Braden va de 6 a 23", () => {
    expect(escala("braden").rangoPuntos()).toEqual({ min: 6, max: 23 });
  });

  test("NEWS2 va de 0 a 20", () => {
    expect(escala("news2").rangoPuntos()).toEqual({ min: 0, max: 20 });
  });
});

describe("sinResponder", () => {
  test("sin respuestas faltan todos los ítems", () => {
    expect(escala("glasgow").sinResponder({})).toHaveLength(3);
  });

  test("con dos respuestas de Glasgow falta la tercera", () => {
    const glasgow = escala("glasgow");
    const faltan = glasgow.sinResponder(responder(glasgow, [4, 5]));
    expect(faltan.map((item) => item.id)).toEqual(["motora"]);
  });
});

describe("sumaParcial", () => {
  test("suma solo lo respondido", () => {
    const glasgow = escala("glasgow");
    expect(glasgow.sumaParcial(responder(glasgow, [4, 5]))).toBe(9);
  });

  test("sin respuestas es 0", () => {
    expect(escala("glasgow").sumaParcial({})).toBe(0);
  });
});
