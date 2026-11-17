import { useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { Boton } from "@/componentes/boton";
import { CampoNumero } from "@/componentes/campo-numero";
import { Mensaje } from "@/componentes/mensaje";
import { RangoDosis } from "@/dominio/farmaco";
import { aNumero, formatear } from "@/dominio/numeros";

type Props = {
  rango: RangoDosis;
  // Todos los rangos del fármaco, para saber si alguno vale para el peso.
  rangos: RangoDosis[];
  // El peso lo guarda la ficha porque también lo usan las tarjetas de rango.
  pedirPeso: boolean;
  peso: string;
  alCambiarPeso: (texto: string) => void;
};

type Comprobacion = { correcta: boolean; texto: string; avisoPeso: string | null };

// Compara una dosis con el máximo de referencia (R03F02T01).
export function ComprobarDosis({ rango, rangos, pedirPeso, peso, alCambiarPeso }: Props) {
  const [dosis, setDosis] = useState("");
  const [comprobacion, setComprobacion] = useState<Comprobacion | null>(null);
  const [error, setError] = useState("");

  function comprobar() {
    Keyboard.dismiss();
    setComprobacion(null);

    const dosisMg = aNumero(dosis);
    const pesoKg = pedirPeso && peso.trim() !== "" ? aNumero(peso) : null;

    if (Number.isNaN(dosisMg) || dosisMg <= 0) {
      setError("Escribe una dosis mayor que 0.");
      return;
    }
    if (pesoKg !== null && (Number.isNaN(pesoKg) || pesoKg <= 0)) {
      setError("Escribe un peso mayor que 0.");
      return;
    }
    // Los rangos por kilo necesitan el peso.
    if (rango.tipo === "por_kg" && pesoKg === null) {
      setError("Escribe un peso mayor que 0.");
      return;
    }

    const maximo = `${formatear(rango.limitesMg(pesoKg).max)} mg`;
    let avisoPeso: string | null = null;
    if (pesoKg !== null && !rango.correspondeAPeso(pesoKg)) {
      avisoPeso = rangos.some((r) => r.correspondeAPeso(pesoKg))
        ? `Este rango no es para ${formatear(pesoKg)} kg. Elige el que corresponde.`
        : `Ningún rango de este fármaco es para ${formatear(pesoKg)} kg. Comprueba la dosis con la ficha técnica o con el médico.`;
    }

    // Solo avisa por encima del máximo.
    if (rango.superaMaximo(dosisMg, pesoKg)) {
      setComprobacion({
        correcta: false,
        texto: `Supera el máximo de referencia (${maximo}). Revisa la prescripción.`,
        avisoPeso,
      });
    } else {
      setComprobacion({
        correcta: true,
        texto: `No supera el máximo de referencia (${maximo}).`,
        avisoPeso,
      });
    }
    setError("");
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.fila}>
        {pedirPeso && (
          <View style={styles.mitad}>
            <CampoNumero
              etiqueta="Peso"
              unidad="kg"
              valor={peso}
              alCambiar={(texto) => {
                alCambiarPeso(texto);
                setComprobacion(null);
              }}
            />
          </View>
        )}
        <View style={styles.mitad}>
          <CampoNumero
            etiqueta="Dosis"
            unidad="mg"
            valor={dosis}
            alCambiar={(texto) => {
              setDosis(texto);
              setComprobacion(null);
            }}
          />
        </View>
      </View>

      {error !== "" && <Mensaje tipo="error">{error}</Mensaje>}

      {comprobacion !== null && (
        <Mensaje tipo={comprobacion.correcta ? "correcto" : "aviso"}>{comprobacion.texto}</Mensaje>
      )}
      {comprobacion !== null && comprobacion.avisoPeso !== null && (
        <Mensaje tipo="aviso">{comprobacion.avisoPeso}</Mensaje>
      )}

      <Boton texto="Comprobar dosis" alPulsar={comprobar} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 12 },
  fila: { flexDirection: "row", gap: 10 },
  mitad: { flex: 1 },
});
