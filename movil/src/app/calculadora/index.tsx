import { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CampoNumero } from "@/componentes/campo-numero";
import { CalculadoraClinica } from "@/dominio/calculadora-clinica";
import { aNumero, formatear } from "@/dominio/numeros";
import { colores } from "@/tema/colores";

// Los tres cálculos de CU01.
type TipoCalculo = "dosis" | "concentracion" | "ritmo";

type Campo = { etiqueta: string; unidad: string };

// Lo que se muestra de cada resultado: qué es, cuánto vale y cómo se ha calculado.
type Resultado = { titulo: string; valor: string; formula: string };

// Cada cálculo tiene dos campos numéricos.
const CALCULOS: { tipo: TipoCalculo; nombre: string; campos: [Campo, Campo] }[] = [
  {
    tipo: "dosis",
    nombre: "Dosis",
    campos: [
      { etiqueta: "Peso", unidad: "kg" },
      { etiqueta: "Dosis", unidad: "mg/kg" },
    ],
  },
  {
    tipo: "concentracion",
    nombre: "Dilución",
    campos: [
      { etiqueta: "Cantidad", unidad: "mg" },
      { etiqueta: "Volumen", unidad: "ml" },
    ],
  },
  {
    tipo: "ritmo",
    nombre: "Ritmo",
    campos: [
      { etiqueta: "Volumen", unidad: "ml" },
      { etiqueta: "Tiempo", unidad: "h" },
    ],
  },
];

export default function PantallaCalculadora() {
  const [calculo, setCalculo] = useState<TipoCalculo>("dosis");
  const [valor1, setValor1] = useState("");
  const [valor2, setValor2] = useState("");
  const [factor, setFactor] = useState(20);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [error, setError] = useState("");

  // Campos del cálculo elegido. El ! indica que siempre se encuentra uno.
  const campos = CALCULOS.find((c) => c.tipo === calculo)!.campos;

  // Si cambia cualquier dato, el resultado anterior ya no es válido y se borra.
  function limpiarResultado() {
    setResultados([]);
    setError("");
  }

  // Al cambiar de cálculo se vacían los campos para no mezclar datos.
  function elegirCalculo(tipo: TipoCalculo) {
    setCalculo(tipo);
    setValor1("");
    setValor2("");
    limpiarResultado();
  }

  function calcular() {
    Keyboard.dismiss();
    limpiarResultado();

    const a = aNumero(valor1);
    const b = aNumero(valor2);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      setError("Rellena los dos campos con números");
      return;
    }

    // CalculadoraClinica lanza un error si un dato no es válido.
    try {
      if (calculo === "dosis") {
        const mg = CalculadoraClinica.dosisPorPeso(a, b);
        setResultados([
          {
            titulo: "Dosis",
            valor: `${formatear(mg)} mg`,
            formula: `${formatear(a)} kg × ${formatear(b)} mg/kg`,
          },
        ]);
      } else if (calculo === "concentracion") {
        const mgMl = CalculadoraClinica.concentracion(a, b);
        setResultados([
          {
            titulo: "Concentración",
            valor: `${formatear(mgMl)} mg/ml`,
            formula: `${formatear(a)} mg ÷ ${formatear(b)} ml`,
          },
        ]);
      } else {
        const mlH = CalculadoraClinica.ritmoMlPorHora(a, b);
        const gotas = CalculadoraClinica.ritmoGotasPorMin(a, b, factor);
        setResultados([
          {
            titulo: "Ritmo de bomba",
            valor: `${formatear(mlH)} ml/h`,
            formula: `${formatear(a)} ml ÷ ${formatear(b)} h`,
          },
          {
            titulo: "Ritmo de goteo",
            valor: `${gotas} gotas/min`,
            formula: `(${formatear(a)} ml × ${factor} gotas/ml) ÷ ${formatear(b * 60)} min, redondeado`,
          },
        ]);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.selector}>
        {CALCULOS.map((c) => (
          <Pressable
            key={c.tipo}
            onPress={() => elegirCalculo(c.tipo)}
            style={[styles.opcion, calculo === c.tipo && styles.opcionActiva]}
          >
            <Text style={styles.opcionTexto}>{c.nombre}</Text>
          </Pressable>
        ))}
      </View>

      <CampoNumero
        etiqueta={campos[0].etiqueta}
        unidad={campos[0].unidad}
        valor={valor1}
        alCambiar={(texto) => {
          setValor1(texto);
          limpiarResultado();
        }}
      />
      <CampoNumero
        etiqueta={campos[1].etiqueta}
        unidad={campos[1].unidad}
        valor={valor2}
        alCambiar={(texto) => {
          setValor2(texto);
          limpiarResultado();
        }}
      />

      {calculo === "ritmo" && (
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Factor de goteo (gotas/ml)</Text>
          <View style={styles.selector}>
            {CalculadoraClinica.FACTORES_GOTEO.map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setFactor(f);
                  limpiarResultado();
                }}
                style={[styles.opcion, factor === f && styles.opcionActiva]}
              >
                <Text style={styles.opcionTexto}>{f}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Pressable onPress={calcular} style={styles.boton}>
        <Text style={styles.botonTexto}>Calcular</Text>
      </Pressable>

      {error !== "" && (
        <View style={styles.error}>
          <Text style={styles.errorTexto}>{error}</Text>
        </View>
      )}

      {resultados.map((r) => (
        <View key={r.titulo} style={styles.resultado}>
          <Text style={styles.etiqueta}>{r.titulo}</Text>
          <Text style={styles.resultadoValor}>{r.valor}</Text>
          <Text style={styles.etiqueta}>Fórmula: {r.formula}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedor: {
    padding: 16,
    gap: 16,
  },
  campo: {
    gap: 4,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  selector: {
    flexDirection: "row",
    gap: 8,
  },
  opcion: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionActiva: {
    backgroundColor: colores.primario,
  },
  opcionTexto: {
    color: colores.texto,
    fontSize: 16,
  },
  boton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colores.primario,
  },
  botonTexto: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colores.errorFondo,
  },
  errorTexto: {
    color: colores.errorTexto,
    fontSize: 16,
  },
  resultado: {
    padding: 12,
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  resultadoValor: {
    color: colores.texto,
    fontSize: 28,
    fontWeight: "700",
  },
});