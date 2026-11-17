// Copia de servidor/src/esquemas.ts: si cambias uno, cambia el otro.
import { z } from "zod";

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
    pesoMinKg: positivoONull,
    pesoMaxKg: positivoONull,
    nota: z.string().nullable(),
    fuente: texto,
    fuenteUrl: z.url(),
  })
  // El mínimo no puede superar al máximo.
  .refine((rango) => rango.dosisMin <= rango.dosisMax, {
    message: "dosisMin no puede ser mayor que dosisMax",
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
  arbol: z.object({
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
  }),
});

export const EsquemaContenido = z.object({
  farmacos: z.array(EsquemaFarmaco),
  escalas: z.array(EsquemaEscala),
  guias: z.array(EsquemaGuia),
});

// Tipo de TypeScript que sale del esquema.
export type Contenido = z.infer<typeof EsquemaContenido>;

// Lo que devuelve /sync/contenido: el contenido más su versión (R07F02T01).
export const EsquemaRespuestaContenido = EsquemaContenido.extend({
  version: z.number().int().positive(),
});
