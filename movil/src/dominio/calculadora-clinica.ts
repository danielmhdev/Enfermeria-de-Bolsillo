/**
 * Fórmulas de la calculadora clínica (R02).
 * Es una clase de utilidad: no guarda datos y todos sus métodos son
 * estáticos, así que se usa sin crear un objeto con new.
 */
export class CalculadoraClinica {
  // Gotas por ml de los equipos de gotero: 20 (macrogotero) y 60 (microgotero).
  static readonly FACTORES_GOTEO = [20, 60];

  /**
   * Dosis total según el peso del paciente.
   * Fórmula: peso (kg) × dosis (mg/kg) = dosis (mg).
   * Ejemplo: 70 kg × 5 mg/kg = 350 mg.
   */
  static dosisPorPeso(pesoKg: number, dosisMgKg: number): number {
    // Con un peso o una dosis de 0 o negativos el resultado no tiene sentido clínico.
    if (pesoKg <= 0 || dosisMgKg <= 0) {
      throw new Error("El peso y la dosis deben ser mayores que 0");
    }
    return pesoKg * dosisMgKg;
  }

  /**
   * Concentración de una dilución.
   * Fórmula: cantidad (mg) ÷ volumen (ml) = concentración (mg/ml).
   * Ejemplo: 500 mg en 250 ml = 2 mg/ml.
   */
  static concentracion(cantidadMg: number, volumenMl: number): number {
    // Dividir entre 0 no da error en JavaScript, devuelve Infinity.
    // Por eso se comprueba antes de calcular.
    if (cantidadMg <= 0 || volumenMl <= 0) {
      throw new Error("La cantidad y el volumen deben ser mayores que 0");
    }
    return cantidadMg / volumenMl;
  }

  /**
   * Ritmo de una bomba de perfusión.
   * Fórmula: volumen (ml) ÷ tiempo (h) = ritmo (ml/h).
   * Ejemplo: 1.000 ml en 8 h = 125 ml/h.
   */
  static ritmoMlPorHora(volumenMl: number, tiempoH: number): number {
    // Un tiempo de 0 daría Infinity en la división.
    if (volumenMl <= 0 || tiempoH <= 0) {
      throw new Error("El volumen y el tiempo deben ser mayores que 0");
    }
    return volumenMl / tiempoH;
  }

  /**
   * Ritmo de un gotero por gravedad, sin bomba.
   * Fórmula: (volumen (ml) × factor de goteo (gotas/ml)) ÷ tiempo (min) = gotas/min.
   * Ejemplo: 1.000 ml en 8 h con factor 20 = 42 gotas/min.
   */
  static ritmoGotasPorMin(
    volumenMl: number,
    tiempoH: number,
    factorGoteo: number,
  ): number {
    if (volumenMl <= 0 || tiempoH <= 0) {
      throw new Error("El volumen y el tiempo deben ser mayores que 0");
    }
    // Solo se aceptan los factores de la lista FACTORES_GOTEO.
    if (!CalculadoraClinica.FACTORES_GOTEO.includes(factorGoteo)) {
      throw new Error("El factor de goteo debe ser 20 o 60");
    }
    // El tiempo llega en horas y el resultado es por minuto.
    const minutos = tiempoH * 60;
    // Se redondea porque no se pueden contar fracciones de gota.
    return Math.round((volumenMl * factorGoteo) / minutos);
  }
}
