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
    public readonly fuenteUrl: string,
    // Segundo máximo diario en mg/kg, solo en rangos fijos (R03F02T03).
    public readonly maxDiarioPorKg: number | null = null
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

  tieneMaximoDiario(): boolean {
    return this.maxDiario !== null || this.maxDiarioPorKg !== null;
  }

  // Máximo en 24 h, en mg, para ese peso; null si no hay máximo diario.
  // Con dos máximos («30 mg o 0,5 mg/kg») vale el menor. Sin peso,
  // el de mg/kg no se puede calcular y se usa solo el de mg.
  maxDiarioMg(pesoKg: number | null): number | null {
    const maximos: number[] = [];
    if (this.maxDiario !== null) {
      if (this.tipo === "fija") {
        maximos.push(this.maxDiario);
      } else if (pesoKg === null) {
        throw new Error("Este rango necesita el peso del paciente.");
      } else {
        maximos.push(CalculadoraClinica.dosisPorPeso(pesoKg, this.maxDiario));
      }
    }
    if (this.maxDiarioPorKg !== null && pesoKg !== null) {
      maximos.push(CalculadoraClinica.dosisPorPeso(pesoKg, this.maxDiarioPorKg));
    }
    return maximos.length === 0 ? null : Math.min(...maximos);
  }

  // Dosis × veces en 24 h por encima del máximo diario (R03F02T03).
  // Sin máximo diario no hay nada con qué comparar.
  superaMaximoDiario(dosisMg: number, veces: number, pesoKg: number | null): boolean {
    const maximo = this.maxDiarioMg(pesoKg);
    return maximo !== null && dosisMg * veces > maximo;
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
