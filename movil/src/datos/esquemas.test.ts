import escalas from "./contenido/escalas.json";
import farmacos from "./contenido/farmacos.json";
import { EsquemaContenido, EsquemaRespuestaContenido } from "./esquemas";

test("el contenido que lleva la app es válido", () => {
  const resultado = EsquemaContenido.safeParse({ farmacos, escalas, guias: [] });
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
