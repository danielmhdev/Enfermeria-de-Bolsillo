import { z } from "zod";

// Esquemas de validación del contenido (R09F01T01).

// No puede estar vacío.
const texto = z.string().min(1);

// Mayor que cero, o null si no se aplica.
const positivoONull = z.number().positive().nullable();

const EsquemaRango = z
  .object({
    via: z.enum(["IV", "VO", "SC", "IM"]),
    indicacion: texto,
    tipo: z.enum(["fija", "por_kg"]),
    dosisMin: z.number().positive(),
    dosisMax: z.number().positive(),
    intervaloH: positivoONull,
    maxDiario: positivoONull,
    // Segundo máximo diario en mg/kg, solo en rangos fijos (R03F02T03):
    // «30 mg o 0,5 mg/kg», vale el menor. Si no aparece en el JSON, es null.
    maxDiarioPorKg: positivoONull.default(null),
    pesoMinKg: positivoONull,
    pesoMaxKg: positivoONull,
    nota: z.string().nullable(),
    fuente: texto,
    fuenteUrl: z.url(),
  })
  // El mínimo no puede superar al máximo.
  .refine((rango) => rango.dosisMin <= rango.dosisMax, {
    message: "dosisMin no puede ser mayor que dosisMax",
  })
  // En un rango por kilo, maxDiario ya está en mg/kg.
  .refine((rango) => rango.tipo === "fija" || rango.maxDiarioPorKg === null, {
    message: "maxDiarioPorKg solo se usa en rangos de dosis fija",
  });

export const EsquemaFarmaco = z.object({
  nombre: texto,
  rangos: z.array(EsquemaRango).min(1),
});

// Misma forma que DefinicionEscala en la app.
export const EsquemaEscala = z.object({
  codigo: texto,
  nombre: texto,
  definicion: z.object({
    fuente: texto,
    avisoSiItemPuntua: z.number().nullable(),
    selector: z
      .object({ id: texto, opciones: z.array(texto), porDefecto: texto })
      .nullable(),
    items: z
      .array(
        z.object({
          id: texto,
          texto: texto,
          opciones: z
            .array(
              z.object({
                texto: texto,
                puntos: z.number(),
                variante: z.string().nullable(),
              })
            )
            .min(1),
        })
      )
      .min(1),
    interpretacion: z
      .array(z.object({ min: z.number(), max: z.number(), texto: texto }))
      .min(1),
  }),
});

export const EsquemaGuia = z.object({
  codigo: texto,
  nombre: texto,
  arbol: z
    .object({
      inicio: texto,
      nodos: z
        .array(
          z.object({
            id: texto,
            tipo: z.enum(["pregunta", "recomendacion"]),
            texto: texto,
            fuente: z.string().nullable(),
            respuestas: z.array(z.object({ texto: texto, siguiente: texto })),
          })
        )
        .min(1),
    })
    // El inicio y cada respuesta llevan a un nodo que existe.
    .refine(
      (arbol) => {
        const ids = arbol.nodos.map((nodo) => nodo.id);
        return (
          ids.includes(arbol.inicio) &&
          arbol.nodos.every((nodo) => nodo.respuestas.every((r) => ids.includes(r.siguiente)))
        );
      },
      { message: "El árbol enlaza con un nodo que no existe" }
    )
    // Las preguntas tienen respuestas y las recomendaciones no.
    .refine(
      (arbol) =>
        arbol.nodos.every((nodo) =>
          nodo.tipo === "pregunta" ? nodo.respuestas.length > 0 : nodo.respuestas.length === 0
        ),
      { message: "Una pregunta sin respuestas o una recomendación con respuestas" }
    ),
});

export const EsquemaContenido = z.object({
  farmacos: z.array(EsquemaFarmaco),
  escalas: z.array(EsquemaEscala),
  guias: z.array(EsquemaGuia),
});

// Tipo de TypeScript que sale del esquema.
export type Contenido = z.infer<typeof EsquemaContenido>;
