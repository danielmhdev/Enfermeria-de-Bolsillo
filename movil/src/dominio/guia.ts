// Misma forma que el JSON de guia.arbol.
export type Respuesta = { texto: string; siguiente: string };

export type Nodo = {
  id: string;
  tipo: "pregunta" | "recomendacion";
  texto: string;
  fuente: string | null;
  respuestas: Respuesta[];
};

export type Arbol = { inicio: string; nodos: Nodo[] };

export class Guia {
  constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly arbol: Arbol
  ) {}

  // El árbol ya se validó al guardarlo, así que el nodo tiene que existir.
  nodo(id: string): Nodo {
    const encontrado = this.arbol.nodos.find((nodo) => nodo.id === id);
    if (encontrado === undefined) {
      throw new Error(`No existe el nodo ${id}.`);
    }
    return encontrado;
  }
}
