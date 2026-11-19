// Minúsculas y sin tildes, para buscar.
// Debe dar lo mismo que la de movil/src/dominio/texto.ts: si cambias una, cambia la otra.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD") // separa cada letra de su tilde: "á" pasa a "a" + "´"
    .replace(/[\u0300-\u036f]/g, "") // borra las tildes sueltas
    .toLowerCase()
    .trim();
}
