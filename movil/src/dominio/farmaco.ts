import { CalculadoraClinica } from "./calculadora-clinica";

export type Via ="IV" | "VO" | "SC" | "IM";
export type TipoDosis = "fija" | "por_kg";

// Rango de dosis de referencia de un fármaco, para una vía y una indicación.
export class RangoDosis {
  constructor(
    public readonly id: number,
    public readonly via: Via,
    public readonly indicacion: string,
    public readonly tipo: TipoDosis,
    public readonly dosisMin: number,
    public readonly dosisMax: number,
    public readonly intervaloH: number | null,
    public readonly maxDiario: number | null,
    public readonly pesoMinKg: number | null,
    public readonly pesoMaxKg: number | null,
    public readonly nota: string | null,
    public readonly fuente: string,
    public readonly fuenteUrl: string
  ) {}

  // Límites del rango en mg. En los rangos por kilo se calculan con el peso del paciente.
  limitesMg(pesoKg: number | null): { min: number; max: number } {
    if (this.tipo === "fija") {
      return { min: this.dosisMin, max: this.dosisMax };
    }
    if (pesoKg === null) {
      throw new Error("Este rango necesita el peso del paciente.");
    }
    return {
      min: CalculadoraClinica.dosisPorPeso(pesoKg, this.dosisMin),
      max: CalculadoraClinica.dosisPorPeso(pesoKg, this.dosisMax),
    };
  }

  // Indica si una dosis en mg supera el máximo de referencia (R03F02T01). Es lo que activa el aviso:
  // una dosis por debajo del mínimo no avisa.
  superaMaximo(dosisMg: number, pesoKg: number | null): boolean {
    return dosisMg > this.limitesMg(pesoKg).max;
  }
}

// Fármaco del catálogo con sus rangos (composición: el rango no existe sin el fármaco).
export class Farmaco {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly rangos: RangoDosis[]
  ) {}
}
