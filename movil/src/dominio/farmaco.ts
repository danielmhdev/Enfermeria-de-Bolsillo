import { CalculadoraClinica } from "./calculadora-clinica";
import { formatear } from "./numeros";

export type Via ="IV" | "VO" | "SC" | "IM";
export type TipoDosis = "fija" | "por_kg";

// Rango de dosis de un fármaco para una vía y una indicación.
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

  // En los rangos por kilo, los límites dependen del peso.
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

  // Solo avisa por encima del máximo (R03F02T01).
  superaMaximo(dosisMg: number, pesoKg: number | null): boolean {
    return dosisMg > this.limitesMg(pesoKg).max;
  }

  tieneLimitesDePeso(): boolean {
    return this.pesoMinKg !== null || this.pesoMaxKg !== null;
  }

  // «33 a 50 kg», «53 kg o más» o «hasta 50 kg»; null si no tiene límites.
  textoPeso(): string | null {
    if (this.pesoMinKg !== null && this.pesoMaxKg !== null) {
      return `${formatear(this.pesoMinKg)} a ${formatear(this.pesoMaxKg)} kg`;
    }
    if (this.pesoMinKg !== null) {
      return `${formatear(this.pesoMinKg)} kg o más`;
    }
    if (this.pesoMaxKg !== null) {
      return `hasta ${formatear(this.pesoMaxKg)} kg`;
    }
    return null;
  }

  // Los dos límites se toman incluidos: los datos no dicen si «más de 50 kg» incluye el 50.
  // Sin límites, el rango vale para cualquier peso.
  correspondeAPeso(pesoKg: number): boolean {
    if (this.pesoMinKg !== null && pesoKg < this.pesoMinKg) {
      return false;
    }
    return this.pesoMaxKg === null || pesoKg <= this.pesoMaxKg;
  }
}

// Un rango no existe sin su fármaco.
export class Farmaco {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly rangos: RangoDosis[]
  ) {}

  tieneVia(via: Via): boolean {
    return this.rangos.some((rango) => rango.via === via);
  }
}
