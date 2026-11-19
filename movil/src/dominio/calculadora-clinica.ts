// Fórmulas de la calculadora (R02). Los métodos son estáticos: se usan sin new.
export class CalculadoraClinica {
  // Gotas por ml de los equipos de gotero: 20 (macrogotero) y 60 (microgotero).
  static readonly FACTORES_GOTEO = [20, 60];

  // peso (kg) × dosis (mg/kg) = dosis (mg). Ejemplo: 70 kg × 5 mg/kg = 350 mg.
  static dosisPorPeso(pesoKg: number, dosisMgKg: number): number {
    if (pesoKg <= 0 || dosisMgKg <= 0) {
      throw new Error("El peso y la dosis deben ser mayores que 0.");
    }
    return pesoKg * dosisMgKg;
  }

  // cantidad (mg) ÷ volumen (ml) = mg/ml. Ejemplo: 500 mg en 250 ml = 2 mg/ml.
  static concentracion(cantidadMg: number, volumenMl: number): number {
    // Dividir entre 0 no da error en JavaScript: devuelve Infinity.
    if (cantidadMg <= 0 || volumenMl <= 0) {
      throw new Error("La cantidad y el volumen deben ser mayores que 0.");
    }
    return cantidadMg / volumenMl;
  }

  // volumen (ml) ÷ tiempo (h) = ml/h. Ejemplo: 1.000 ml en 8 h = 125 ml/h.
  static ritmoMlPorHora(volumenMl: number, tiempoH: number): number {
    if (volumenMl <= 0 || tiempoH <= 0) {
      throw new Error("El volumen y el tiempo deben ser mayores que 0.");
    }
    return volumenMl / tiempoH;
  }

  // Gotero sin bomba: (volumen × factor de goteo) ÷ minutos = gotas/min.
  static ritmoGotasPorMin(
    volumenMl: number,
    tiempoH: number,
    factorGoteo: number,
  ): number {
    if (volumenMl <= 0 || tiempoH <= 0) {
      throw new Error("El volumen y el tiempo deben ser mayores que 0.");
    }
    if (!CalculadoraClinica.FACTORES_GOTEO.includes(factorGoteo)) {
      throw new Error("El factor de goteo debe ser 20 o 60.");
    }
    // El tiempo llega en horas y el resultado es por minuto.
    const minutos = tiempoH * 60;
    // No se pueden contar fracciones de gota.
    return Math.round((volumenMl * factorGoteo) / minutos);
  }
}
