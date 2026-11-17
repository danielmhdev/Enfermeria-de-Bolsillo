// Minúsculas y sin tildes, para buscar.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD") // separa cada letra de su tilde: "á" pasa a "a" + "´"
    .replace(/[\u0300-\u036f]/g, "") // borra las tildes sueltas
    .toLowerCase()
    .trim();
}
