import { normalizar, partirCoincidencia } from "./texto";

describe("normalizar", () => {
  test("quita las tildes y pasa a minúsculas", () => {
    expect(normalizar("Ácido Fólico")).toBe("acido folico");
  });

  test("quita los espacios del principio y del final", () => {
    expect(normalizar("  Heparina ")).toBe("heparina");
  });
});

describe("partirCoincidencia", () => {
  test("resalta sin tener en cuenta tildes ni mayúsculas", () => {
    expect(partirCoincidencia("Ondansetrón", "TRON")).toEqual(["Ondanse", "trón", ""]);
  });

  test("encuentra la marca entre paréntesis", () => {
    expect(partirCoincidencia("Metamizol (Nolotil)", "nolo")).toEqual([
      "Metamizol (",
      "Nolo",
      "til)",
    ]);
  });

  test("devuelve null si no aparece o la búsqueda está vacía", () => {
    expect(partirCoincidencia("Omeprazol", "furo")).toBeNull();
    expect(partirCoincidencia("Omeprazol", "  ")).toBeNull();
  });
});
