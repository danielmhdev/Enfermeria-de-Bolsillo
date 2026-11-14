import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { CampoNumero } from "@/componentes/campo-numero";
import { RangoDosis } from "@/dominio/farmaco";
import { aNumero, formatear } from "@/dominio/numeros";
import { colores } from "@/tema/colores";

type Props = { rango: RangoDosis };

// Resultado de la comprobación: si la dosis no supera el máximo y el texto que se muestra.
type Comprobacion = { correcta: boolean; texto: string };

// Formulario que compara una dosis con el máximo de referencia (R03F02T01).
export function ComprobarDosis({ rango }: Props) {
  const [dosis, setDosis] = useState("");
  const [peso, setPeso] = useState("");
  const [comprobacion, setComprobacion] = useState<Comprobacion | null>(null);
  const [error, setError] = useState("");

  const porKilo = rango.tipo === "por_kg";

  function comprobar() {
    Keyboard.dismiss();
    setComprobacion(null);

    const dosisMg = aNumero(dosis);
    // En los rangos fijos no se pide el peso.
    const pesoKg = porKilo ? aNumero(peso) : null;

    if (Number.isNaN(dosisMg) || dosisMg <= 0) {
      setError("Escribe una dosis mayor que 0.");
      return;
    }
    // Un peso vacío es NaN y la calculadora no lo detecta como error.
    if (pesoKg !== null && Number.isNaN(pesoKg)) {
      setError("Escribe un peso mayor que 0.");
      return;
    }

    try {
      const maximo = `${formatear(rango.limitesMg(pesoKg).max)} mg`;

      // Solo se avisa por encima del máximo; una dosis baja no da aviso.
      if (rango.superaMaximo(dosisMg, pesoKg)) {
        setComprobacion({
          correcta: false,
          texto: `Supera el máximo de referencia (${maximo}). Revisa la prescripción.`,
        });
      } else {
        setComprobacion({
          correcta: true,
          texto: `No supera el máximo de referencia (${maximo}).`,
        });
      }
      setError("");
    } catch {
      // limitesMg lanza un error si el peso es 0 o negativo.
      setError("Escribe un peso mayor que 0.");
    }
  }

  return (
    <View style={styles.contenedor}>
      {porKilo && (
        <CampoNumero etiqueta="Peso" unidad="kg" valor={peso} alCambiar={setPeso} />
      )}
      <CampoNumero etiqueta="Dosis" unidad="mg" valor={dosis} alCambiar={setDosis} />

      <Pressable style={styles.boton} onPress={comprobar}>
        <Text style={styles.botonTexto}>Comprobar dosis</Text>
      </Pressable>

      {error !== "" && (
        <View style={[styles.caja, styles.cajaError]}>
          <Text style={styles.textoError}>{error}</Text>
        </View>
      )}

      {comprobacion !== null && (
        <View style={[styles.caja, comprobacion.correcta ? styles.cajaCorrecto : styles.cajaAviso]}>
          <Text style={comprobacion.correcta ? styles.textoCorrecto : styles.textoAviso}>
            {comprobacion.correcta ? "✓" : "⚠"} {comprobacion.texto}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 8, marginTop: 8 },
  boton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colores.primario,
  },
  botonTexto: { color: colores.texto, fontSize: 16, fontWeight: "600" },
  caja: { padding: 12, borderRadius: 8 },
  cajaError: { backgroundColor: colores.errorFondo },
  cajaAviso: { backgroundColor: colores.avisoFondo },
  cajaCorrecto: { backgroundColor: colores.correctoFondo },
  textoError: { color: colores.errorTexto, fontSize: 16 },
  textoAviso: { color: colores.avisoTexto, fontSize: 16, fontWeight: "600" },
  textoCorrecto: { color: colores.correctoTexto, fontSize: 16 },
});
