// Texto de un campo a número. Acepta coma o punto.
// Devuelve NaN si está vacío o no es válido.
export function aNumero(texto: string): number {
  if (texto.trim() === "") {
    return NaN;
  }
  return Number(texto.replace(",", "."));
}

// Dos decimales como máximo y coma decimal.
export function formatear(numero: number): string {
  const redondeado = Math.round(numero * 100) / 100;
  return String(redondeado).replace(".", ",");
}
