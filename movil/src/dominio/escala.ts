// Misma forma que el JSON de escala.definicion.
export type Opcion = { texto: string; puntos: number; variante: string | null };
export type ItemEscala = { id: string; texto: string; opciones: Opcion[] };
export type Tramo = { min: number; max: number; texto: string };
export type Selector = { id: string; opciones: string[]; porDefecto: string };

export type DefinicionEscala = {
  fuente: string;
  avisoSiItemPuntua: number | null;
  selector: Selector | null;
  items: ItemEscala[];
  interpretacion: Tramo[];
};

// Opción elegida en cada ítem, por id de ítem.
export type Respuestas = Record<string, Opcion>;

export class Escala {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly definicion: DefinicionEscala
  ) {}

  // Opciones de un ítem para la variante elegida (R04F02T02).
  // Las opciones sin variante valen siempre.
  opcionesDe(item: ItemEscala, variante: string | null): Opcion[] {
    return item.opciones.filter(
      (opcion) => opcion.variante === null || opcion.variante === variante
    );
  }

  // null si falta algún ítem (R04F01T01).
  total(respuestas: Respuestas): number | null {
    let suma = 0;
    for (const item of this.definicion.items) {
      const respuesta = respuestas[item.id];
      if (respuesta === undefined) {
        return null;
      }
      suma += respuesta.puntos;
    }
    return suma;
  }

  // null si el total no está en ningún tramo.
  interpretar(total: number): string | null {
    for (const tramo of this.definicion.interpretacion) {
      if (total >= tramo.min && total <= tramo.max) {
        return tramo.texto;
      }
    }
    return null;
  }

  // Algún ítem tiene la puntuación de alerta (R04F01T02).
  parametroRojo(respuestas: Respuestas): boolean {
    const alerta = this.definicion.avisoSiItemPuntua;
    if (alerta === null) {
      return false;
    }
    return Object.values(respuestas).some((opcion) => opcion.puntos === alerta);
  }
}
