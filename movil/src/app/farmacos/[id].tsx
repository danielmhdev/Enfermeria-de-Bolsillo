import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { Cabecera } from "@/componentes/cabecera";
import { ComprobarDosis } from "@/componentes/comprobar-dosis";
import { Texto } from "@/componentes/texto";
import { FarmacoRepositorio } from "@/datos/farmaco-repositorio";
import { Farmaco, RangoDosis } from "@/dominio/farmaco";
import { aNumero, formatear } from "@/dominio/numeros";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

// "400–1.000 mg" o "1–1,5 mg/kg".
function textoDosis(rango: RangoDosis): string {
  const unidad = rango.tipo === "por_kg" ? "mg/kg" : "mg";
  if (rango.dosisMin === rango.dosisMax) {
    return `${formatear(rango.dosisMin)} ${unidad}`;
  }
  return `${formatear(rango.dosisMin)}–${formatear(rango.dosisMax)} ${unidad}`;
}

export default function PantallaFarmaco() {
  // /farmacos/3 da id = "3".
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  const [farmaco, setFarmaco] = useState<Farmaco | null>(null);
  // Posición del rango elegido para comprobar la dosis.
  const [elegido, setElegido] = useState(0);
  const [peso, setPeso] = useState("");

  useEffect(() => {
    new FarmacoRepositorio(db).porId(Number(id)).then(setFarmaco);
  }, [db, id]);

  if (farmaco === null) {
    return <View style={styles.pantalla} />;
  }

  const rango = farmaco.rangos[elegido];
  const pesoKg = aNumero(peso);
  const pesoValido = !Number.isNaN(pesoKg) && pesoKg > 0;
  // El peso se pide si algún rango es por kilo o tiene límites de peso.
  const pedirPeso = farmaco.rangos.some((r) => r.tipo === "por_kg" || r.tieneLimitesDePeso());

  return (
    // En iOS sube el contenido por encima del teclado.
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Cabecera titulo={farmaco.nombre} volver="Fármacos" />

      <ScrollView
        contentContainerStyle={styles.contenedor}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bloque}>
          <Texto variante="seccion">Rangos de dosis</Texto>
          {farmaco.rangos.length > 1 && (
            <Texto variante="nota">Toca el rango con el que vas a comprobar la dosis.</Texto>
          )}
        </View>

        {farmaco.rangos.map((r, i) => {
          const esElegido = i === elegido;
          // Sobre menta fuerte, el gris secundario no llega a 4,5:1.
          const colorDetalle = esElegido ? colores.texto : colores.textoSecundario;
          return (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityState={{ selected: esElegido }}
              onPress={() => setElegido(i)}
              style={({ pressed }) => [
                styles.rango,
                esElegido && styles.rangoElegido,
                pressed && styles.pulsado,
              ]}
            >
              <View style={styles.filaRango}>
                {esElegido && <Ionicons name="checkmark" size={18} color={colores.texto} />}
                <Texto variante="etiqueta" style={styles.flex}>
                  {r.via} · {r.indicacion}
                </Texto>
              </View>
              <Text style={styles.dosis}>{textoDosis(r)}</Text>
              {r.intervaloH !== null && <Texto>Cada {formatear(r.intervaloH)} h</Texto>}
              {r.maxDiario !== null && (
                <Texto>
                  Máximo diario: {formatear(r.maxDiario)} {r.tipo === "por_kg" ? "mg/kg" : "mg"}
                </Texto>
              )}
              {r.nota !== null && <Texto>{r.nota}</Texto>}
              {pesoValido && r.tieneLimitesDePeso() && (
                <View style={styles.filaRango}>
                  <Ionicons
                    name={r.correspondeAPeso(pesoKg) ? "checkmark-circle-outline" : "warning-outline"}
                    size={20}
                    color={colores.texto}
                  />
                  <Texto variante="etiqueta" style={styles.flex}>
                    Es para {r.textoPeso()}. {r.correspondeAPeso(pesoKg) ? "Vale" : "No vale"} para{" "}
                    {formatear(pesoKg)} kg.
                  </Texto>
                </View>
              )}
              <Texto variante="nota" style={{ color: colorDetalle }}>
                Fuente: {r.fuente}
              </Texto>
            </Pressable>
          );
        })}

        <View style={styles.bloque}>
          <Texto variante="seccion">Comprobar tu dosis</Texto>
          {pedirPeso && (
            <Texto variante="nota">
              El peso sirve para calcular las dosis por kilo y para avisarte si un rango no es para
              ese peso.
            </Texto>
          )}
        </View>
        {/* key: al cambiar de rango se empieza una comprobación nueva. */}
        <ComprobarDosis
          key={rango.id}
          rango={rango}
          rangos={farmaco.rangos}
          pedirPeso={pedirPeso}
          peso={peso}
          alCambiarPeso={setPeso}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { padding: 16, paddingBottom: 40, gap: 12 },
  bloque: { gap: 2 },
  rango: { padding: 18, gap: 6, borderRadius: 24, backgroundColor: colores.menta },
  rangoElegido: { backgroundColor: colores.primario },
  pulsado: { opacity: 0.85 },
  filaRango: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  flex: { flex: 1 },
  dosis: { fontFamily: fuentes.extra, fontSize: 26, lineHeight: 32, color: colores.texto },
});
