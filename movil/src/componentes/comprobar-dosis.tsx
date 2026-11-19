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
  // Si el fármaco depende del peso: entonces se muestra el campo Peso.
  pedirPeso: boolean;
  // El peso lo guarda la ficha porque también lo usan las tarjetas de rango.
  peso: string;
  alCambiarPeso: (texto: string) => void;
};

type Resultado = { correcta: boolean; texto: string };

type Comprobacion = Resultado & {
  avisoPeso: string | null;
  // null si no se han escrito las veces en 24 h.
  diario: Resultado | null;
};

// Compara una dosis con el máximo de referencia (R03F02T01)
// y, si se dicen las veces en 24 h, con el máximo diario (R03F02T03).
export function ComprobarDosis({ rango, rangos, pedirPeso, peso, alCambiarPeso }: Props) {
  const [dosis, setDosis] = useState("");
  const [veces, setVeces] = useState("");
  const [comprobacion, setComprobacion] = useState<Comprobacion | null>(null);
  const [error, setError] = useState("");

  // Solo se pregunta si hay un máximo diario con el que comparar.
  const pedirVeces = rango.tieneMaximoDiario();

  function comprobar() {
    Keyboard.dismiss();
    setComprobacion(null);

    const dosisMg = aNumero(dosis);
    const pesoKg = pedirPeso && peso.trim() !== "" ? aNumero(peso) : null;
    // Opcional: vacío = solo se comprueba la dosis.
    const vecesAlDia = pedirVeces && veces.trim() !== "" ? aNumero(veces) : null;

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
    if (vecesAlDia !== null && (!Number.isInteger(vecesAlDia) || vecesAlDia <= 0)) {
      setError("Escribe cuántas veces en 24 h: un número entero mayor que 0.");
      return;
    }

    const maximo = `${formatear(rango.limitesMg(pesoKg).max)} mg`;
    let avisoPeso: string | null = null;
    if (pesoKg !== null && !rango.correspondeAPeso(pesoKg)) {
      avisoPeso = rangos.some((r) => r.correspondeAPeso(pesoKg))
        ? `Este rango no es para ${formatear(pesoKg)} kg. Elige el que corresponde.`
        : `Ningún rango de este fármaco es para ${formatear(pesoKg)} kg. Comprueba la dosis con la ficha técnica o con el médico.`;
    }

    let diario: Resultado | null = null;
    if (vecesAlDia !== null) {
      const maximoDiarioMg = rango.maxDiarioMg(pesoKg);
      // Solo pasa si el único máximo es por kilo y no hay peso.
      if (maximoDiarioMg === null) {
        setError("Escribe el peso para comprobar el máximo diario.");
        return;
      }
      const total = `${formatear(dosisMg * vecesAlDia)} mg`;
      const maximoDiario = `${formatear(maximoDiarioMg)} mg`;
      // Sin peso, el de mg/kg no se ha podido comprobar.
      const faltaPeso =
        rango.maxDiarioPorKg !== null && pesoKg === null
          ? ` Escribe el peso para comprobar también los ${formatear(rango.maxDiarioPorKg)} mg/kg.`
          : "";
      diario = rango.superaMaximoDiario(dosisMg, vecesAlDia, pesoKg)
        ? {
            correcta: false,
            texto: `En 24 h serían ${total}: supera el máximo diario (${maximoDiario}).${faltaPeso}`,
          }
        : {
            correcta: true,
            texto: `En 24 h serían ${total}: no supera el máximo diario (${maximoDiario}).${faltaPeso}`,
          };
    }

    // Solo avisa por encima del máximo.
    if (rango.superaMaximo(dosisMg, pesoKg)) {
      setComprobacion({
        correcta: false,
        texto: `Supera el máximo de referencia (${maximo}). Revisa la prescripción.`,
        avisoPeso,
        diario,
      });
    } else {
      setComprobacion({
        correcta: true,
        texto: `No supera el máximo de referencia (${maximo}).`,
        avisoPeso,
        diario,
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
        {pedirVeces && (
          <View style={styles.mitad}>
            <CampoNumero
              etiqueta="Veces en 24 h"
              unidad="veces"
              valor={veces}
              alCambiar={(texto) => {
                setVeces(texto);
                setComprobacion(null);
              }}
            />
          </View>
        )}
      </View>

      {error !== "" && <Mensaje tipo="error">{error}</Mensaje>}

      {comprobacion !== null && (
        <Mensaje tipo={comprobacion.correcta ? "correcto" : "aviso"}>{comprobacion.texto}</Mensaje>
      )}
      {comprobacion !== null && comprobacion.diario !== null && (
        <Mensaje tipo={comprobacion.diario.correcta ? "correcto" : "aviso"}>
          {comprobacion.diario.texto}
        </Mensaje>
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
  // Si no caben, los campos bajan a otra línea.
  fila: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  // Dos por línea; el que baja solo ocupa todo el ancho.
  mitad: { flexGrow: 1, flexBasis: "40%" },
});
