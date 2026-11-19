import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Boton } from "@/componentes/boton";
import { Cabecera } from "@/componentes/cabecera";
import { CampoNumero } from "@/componentes/campo-numero";
import { Mensaje } from "@/componentes/mensaje";
import { Opcion } from "@/componentes/opcion";
import { Pie } from "@/componentes/pie";
import { Tarjeta } from "@/componentes/tarjeta";
import { Texto } from "@/componentes/texto";
import { CalculadoraClinica } from "@/dominio/calculadora-clinica";
import { aNumero, formatear } from "@/dominio/numeros";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

// Los tres cálculos de CU01.
type TipoCalculo = "dosis" | "concentracion" | "ritmo";

type Campo = { etiqueta: string; unidad: string };

type Resultado = { titulo: string; numero: string; unidad: string; formula: string };

const CALCULOS: { tipo: TipoCalculo; nombre: string; campos: [Campo, Campo] }[] = [
  {
    tipo: "dosis",
    nombre: "Dosis por peso",
    campos: [
      { etiqueta: "Peso", unidad: "kg" },
      { etiqueta: "Dosis", unidad: "mg/kg" },
    ],
  },
  {
    tipo: "concentracion",
    nombre: "Concentración",
    campos: [
      { etiqueta: "Cantidad", unidad: "mg" },
      { etiqueta: "Volumen", unidad: "ml" },
    ],
  },
  {
    tipo: "ritmo",
    nombre: "Ritmo de perfusión",
    campos: [
      { etiqueta: "Volumen", unidad: "ml" },
      { etiqueta: "Horas", unidad: "h" },
    ],
  },
];

const GOTEROS = [
  { factor: 20, nombre: "Macrogotero" },
  { factor: 60, nombre: "Microgotero" },
];

export default function PantallaCalculadora() {
  const [calculo, setCalculo] = useState<TipoCalculo>("dosis");
  const [valor1, setValor1] = useState("");
  const [valor2, setValor2] = useState("");
  // Minutos, solo en el ritmo.
  const [valor3, setValor3] = useState("");
  const [factor, setFactor] = useState(20);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [error, setError] = useState("");

  // Campos del cálculo elegido.
  const campos = CALCULOS.find((c) => c.tipo === calculo)!.campos;

  // Si cambia un dato, el resultado anterior ya no vale.
  function limpiarResultado() {
    setResultados([]);
    setError("");
  }

  function limpiar() {
    setValor1("");
    setValor2("");
    setValor3("");
    limpiarResultado();
  }

  // Al cambiar de cálculo se vacían los campos.
  function elegirCalculo(tipo: TipoCalculo) {
    setCalculo(tipo);
    limpiar();
  }

  function calcular() {
    Keyboard.dismiss();
    limpiarResultado();

    const a = aNumero(valor1);
    // En el ritmo un campo de tiempo vacío cuenta como 0: «4 h» sin minutos o «45 min» sin horas.
    const b = calculo === "ritmo" && valor2.trim() === "" ? 0 : aNumero(valor2);
    const minutos = valor3.trim() === "" ? 0 : aNumero(valor3);
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(minutos)) {
      setError("Rellena los campos con números.");
      return;
    }

    // CalculadoraClinica lanza un error si un dato no es válido.
    try {
      if (calculo === "dosis") {
        const mg = CalculadoraClinica.dosisPorPeso(a, b);
        setResultados([
          {
            titulo: "Dosis",
            numero: formatear(mg),
            unidad: "mg",
            formula: `${formatear(a)} kg × ${formatear(b)} mg/kg = ${formatear(mg)} mg`,
          },
        ]);
      } else if (calculo === "concentracion") {
        const mgMl = CalculadoraClinica.concentracion(a, b);
        setResultados([
          {
            titulo: "Concentración",
            numero: formatear(mgMl),
            unidad: "mg/ml",
            formula: `${formatear(a)} mg ÷ ${formatear(b)} ml = ${formatear(mgMl)} mg/ml`,
          },
        ]);
      } else {
        const tiempoH = b + minutos / 60;
        const minutosTotales = b * 60 + minutos;
        const mlH = CalculadoraClinica.ritmoMlPorHora(a, tiempoH);
        const gotas = CalculadoraClinica.ritmoGotasPorMin(a, tiempoH, factor);
        setResultados([
          {
            titulo: "Ritmo de bomba",
            numero: formatear(mlH),
            unidad: "ml/h",
            formula: `${formatear(a)} ml ÷ ${formatear(tiempoH)} h = ${formatear(mlH)} ml/h`,
          },
          {
            titulo: "Ritmo de goteo",
            numero: String(gotas),
            unidad: "gotas/min",
            formula: `${formatear(a)} ml × ${factor} ÷ ${formatear(minutosTotales)} min = ${formatear((a * factor) / minutosTotales)} → ${gotas}`,
          },
        ]);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    // En iOS sube el Pie por encima del teclado.
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Cabecera titulo="Calculadora" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.contenedor}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bloque}>
          <Texto variante="etiqueta">Tipo de cálculo</Texto>
          <View style={styles.opciones}>
            {CALCULOS.map((c) => (
              <Opcion
                key={c.tipo}
                texto={c.nombre}
                seleccionada={calculo === c.tipo}
                alPulsar={() => elegirCalculo(c.tipo)}
              />
            ))}
          </View>
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

        <View style={calculo === "ritmo" ? styles.fila : undefined}>
          <View style={calculo === "ritmo" ? styles.mitad : undefined}>
            <CampoNumero
              etiqueta={campos[1].etiqueta}
              unidad={campos[1].unidad}
              valor={valor2}
              alCambiar={(texto) => {
                setValor2(texto);
                limpiarResultado();
              }}
            />
          </View>
          {calculo === "ritmo" && (
            <View style={styles.mitad}>
              <CampoNumero
                etiqueta="Minutos"
                unidad="min"
                valor={valor3}
                alCambiar={(texto) => {
                  setValor3(texto);
                  limpiarResultado();
                }}
              />
            </View>
          )}
        </View>

        {calculo === "ritmo" && (
          <View style={styles.bloque}>
            <Texto variante="etiqueta">Gotero</Texto>
            <View style={styles.fila}>
              {GOTEROS.map((g) => (
                <View key={g.factor} style={styles.mitad}>
                  <Opcion
                    texto={g.nombre}
                    detalle={`${g.factor} gotas/ml`}
                    seleccionada={factor === g.factor}
                    alPulsar={() => {
                      setFactor(g.factor);
                      limpiarResultado();
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {error !== "" && <Mensaje tipo="error">{error}</Mensaje>}

        {resultados.map((r) => (
          <Tarjeta key={r.titulo} style={styles.resultado}>
            <Texto variante="etiqueta">{r.titulo}</Texto>
            <Text style={styles.numero}>
              {r.numero} <Text style={styles.unidad}>{r.unidad}</Text>
            </Text>
            <View style={styles.formula}>
              <Texto variante="nota">{r.formula}</Texto>
            </View>
          </Tarjeta>
        ))}
      </ScrollView>

      <Pie>
        <View style={styles.fila}>
          <Boton texto="Limpiar" variante="secundario" alPulsar={limpiar} />
          <View style={styles.mitad}>
            <Boton texto="Calcular" alPulsar={calcular} />
          </View>
        </View>
      </Pie>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  flex: { flex: 1 },
  contenedor: { padding: 16, paddingBottom: 24, gap: 18 },
  bloque: { gap: 8 },
  opciones: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  fila: { flexDirection: "row", gap: 10 },
  mitad: { flex: 1 },
  resultado: { alignItems: "center" },
  numero: { fontFamily: fuentes.extra, fontSize: 44, lineHeight: 50, color: colores.texto },
  unidad: { fontFamily: fuentes.extra, fontSize: 20, color: colores.texto },
  formula: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colores.blanco,
  },
});
