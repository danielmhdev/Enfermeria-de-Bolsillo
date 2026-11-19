// Minúsculas y sin tildes. Cada letra sigue en su sitio: "Ó" pasa a "o".
function sinTildes(texto: string): string {
  return texto
    .normalize("NFD") // separa cada letra de su tilde: "á" pasa a "a" + "´"
    .replace(/[\u0300-\u036f]/g, "") // borra las tildes sueltas
    .toLowerCase();
}

// «1 ítem», «3 ítems»: el número con la palabra en singular o en plural.
export function contar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

// Para buscar: además, sin espacios al principio ni al final.
// Debe dar lo mismo que la de servidor/src/texto.ts: si cambias una, cambia la otra.
export function normalizar(texto: string): string {
  return sinTildes(texto).trim();
}

// Parte el nombre en [antes, lo buscado, después] para resaltarlo; null si no aparece.
// Se compara sin tildes, pero los trozos salen del nombre original.
export function partirCoincidencia(
  nombre: string,
  busqueda: string
): [string, string, string] | null {
  const buscado = normalizar(busqueda);
  if (buscado === "") {
    return null;
  }
  const inicio = sinTildes(nombre).indexOf(buscado);
  if (inicio === -1) {
    return null;
  }
  const fin = inicio + buscado.length;
  return [nombre.slice(0, inicio), nombre.slice(inicio, fin), nombre.slice(fin)];
}
