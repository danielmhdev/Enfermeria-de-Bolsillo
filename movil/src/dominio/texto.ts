// Prepara un texto para buscar: minúsculas y sin tildes.
// Así "Paracetamol", "paracetamol" y "PARACETAMOL" se encuentran igual.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD") // separa cada letra de su tilde: "á" pasa a "a" + "´"
    .replace(/[̀-ͯ]/g, "") // borra las tildes sueltas
    .toLowerCase()
    .trim();
}
