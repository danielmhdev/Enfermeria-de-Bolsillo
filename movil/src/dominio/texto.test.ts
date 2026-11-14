import { normalizar } from "./texto";

describe("normalizar", () => {
  test("quita las tildes y pasa a minúsculas", () => {
    expect(normalizar("Ácido Fólico")).toBe("acido folico");
  });

  test("quita los espacios del principio y del final", () => {
    expect(normalizar("  Heparina ")).toBe("heparina");
  });
});
