// Convierte el texto de un campo en número. Acepta coma o punto decimal.
// Devuelve NaN (no es un número) si el campo está vacío o no es válido.
export function aNumero(texto: string): number {
  if (texto.trim() === "") {
    return NaN;
  }
  return Number(texto.replace(",", "."));
}

// Escribe un número con dos decimales como máximo y coma decimal.
export function formatear(numero: number): string {
  const redondeado = Math.round(numero * 100) / 100;
  return String(redondeado).replace(".", ",");
}
