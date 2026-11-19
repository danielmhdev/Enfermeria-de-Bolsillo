import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
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
import { Boton } from "@/componentes/boton";
import { Cabecera } from "@/componentes/cabecera";
import { ComprobarDosis } from "@/componentes/comprobar-dosis";
import { Texto } from "@/componentes/texto";
import { FarmacoRepositorio } from "@/datos/farmaco-repositorio";
import { Farmaco, RangoDosis } from "@/dominio/farmaco";
import { aNumero, formatear } from "@/dominio/numeros";
import { colores } from "@/tema/colores";
import { useMargenInferior } from "@/tema/margenes";
import { fuentes } from "@/tema/fuentes";

function unidad(rango: RangoDosis): string {
  return rango.tipo === "por_kg" ? "mg/kg" : "mg";
}

// "400–1.000 mg" o "1–1,5 mg/kg".
function textoDosis(rango: RangoDosis): string {
  if (rango.dosisMin === rango.dosisMax) {
    return `${formatear(rango.dosisMin)} ${unidad(rango)}`;
  }
  return `${formatear(rango.dosisMin)}–${formatear(rango.dosisMax)} ${unidad(rango)}`;
}

// «Cada 4 h · máximo 4.000 mg al día»; null si el rango no tiene ninguno de los dos.
function textoPauta(rango: RangoDosis): string | null {
  const partes: string[] = [];
  if (rango.intervaloH !== null) {
    partes.push(`cada ${formatear(rango.intervaloH)} h`);
  }
  // «máximo 30 mg o 0,5 mg/kg al día (el menor)».
  const maximos: string[] = [];
  if (rango.maxDiario !== null) {
    maximos.push(`${formatear(rango.maxDiario)} ${unidad(rango)}`);
  }
  if (rango.maxDiarioPorKg !== null) {
    maximos.push(`${formatear(rango.maxDiarioPorKg)} mg/kg`);
  }
  if (maximos.length > 0) {
    partes.push(`máximo ${maximos.join(" o ")} al día${maximos.length > 1 ? " (el menor)" : ""}`);
  }
  if (partes.length === 0) {
    return null;
  }
  const texto = partes.join(" · ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// «IV · 50 kg o más», o solo «IV» si el rango no tiene límites de peso.
function etiqueta(rango: RangoDosis): string {
  const peso = rango.textoPeso();
  return peso === null ? rango.via : `${rango.via} · ${peso}`;
}

// «✓ Vale para 45 kg.» o «⚠ No vale para 45 kg.»
function AvisoPeso({ rango, pesoKg }: { rango: RangoDosis; pesoKg: number }) {
  const vale = rango.correspondeAPeso(pesoKg);
  return (
    <View style={styles.fila}>
      <Ionicons
        name={vale ? "checkmark-circle-outline" : "warning-outline"}
        size={20}
        color={colores.texto}
      />
      <Texto variante="etiqueta" style={styles.flex}>
        {vale ? "Vale" : "No vale"} para {formatear(pesoKg)} kg.
      </Texto>
    </View>
  );
}

export default function PantallaFarmaco() {
  // /farmacos/3 da id = "3".
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const margenInferior = useMargenInferior();

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
  const pauta = textoPauta(rango);
  // Los demás rangos, con su posición para poder elegirlos.
  const otros = farmaco.rangos.map((r, i) => ({ r, i })).filter(({ i }) => i !== elegido);
  const pesoKg = aNumero(peso);
  const pesoValido = !Number.isNaN(pesoKg) && pesoKg > 0;
  // Solo hay aviso de peso si se ha escrito uno y el rango tiene límites.
  const avisar = (r: RangoDosis) => pesoValido && r.tieneLimitesDePeso();
  // El peso se pide si algún rango es por kilo, tiene límites de peso
  // o un máximo diario por kilo.
  const pedirPeso = farmaco.rangos.some(
    (r) => r.tipo === "por_kg" || r.tieneLimitesDePeso() || r.maxDiarioPorKg !== null
  );

  return (
    // En iOS sube el contenido por encima del teclado.
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Cabecera titulo={farmaco.nombre} volver="Fármacos" />

      <ScrollView
        contentContainerStyle={[styles.contenedor, { paddingBottom: margenInferior + 16 }]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {/* El rango elegido, en grande. */}
        <View style={styles.destacado}>
          {/* En iOS un Text no redondea su fondo: la etiqueta es un View con el Text dentro. */}
          <View style={styles.chip}>
            <Text style={styles.textoChip}>{etiqueta(rango)}</Text>
          </View>
          <Texto variante="etiqueta">{rango.indicacion}</Texto>
          <Text style={styles.dosis}>{textoDosis(rango)} por dosis</Text>
          {pauta !== null && <Texto>{pauta}</Texto>}
          {rango.nota !== null && <Texto>{rango.nota}</Texto>}
          {avisar(rango) && <AvisoPeso rango={rango} pesoKg={pesoKg} />}
        </View>

        {otros.length > 0 && (
          <View style={styles.bloque}>
            <Texto variante="seccion">Otros rangos</Texto>
            <Texto variante="nota">Toca uno para verlo arriba y comprobar con él.</Texto>
          </View>
        )}
        {otros.map(({ r, i }) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityHint="Lo pone arriba para comprobar la dosis con él"
            onPress={() => setElegido(i)}
            style={({ pressed }) => [styles.otro, pressed && styles.pulsado]}
          >
            <View style={styles.flex}>
              <Texto variante="etiqueta">{r.indicacion}</Texto>
              <Texto variante="nota">
                {etiqueta(r)} · {textoDosis(r)}
              </Texto>
              {avisar(r) && <AvisoPeso rango={r} pesoKg={pesoKg} />}
            </View>
            <Ionicons name="arrow-up-circle-outline" size={24} color={colores.acento} />
          </Pressable>
        ))}

        <View style={styles.comprobar}>
          <View style={styles.bloque}>
            <Texto variante="seccion">Comprobar tu dosis</Texto>
            {pedirPeso && (
              <Texto variante="nota">
                El peso sirve para calcular las dosis por kilo y para avisarte si un rango no es
                para ese peso.
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
        </View>

        {/* Cada rango puede venir de una ficha técnica distinta. */}
        <Texto variante="nota" style={styles.margen}>
          Fuente: {rango.fuente}
        </Texto>
        {/* Abre Safari: la app no envía nada (R11F02). Si falla, no hace nada. */}
        <Boton
          texto="Abrir ficha técnica oficial"
          variante="secundario"
          icono="open-outline"
          alPulsar={() => Linking.openURL(rango.fuenteUrl).catch(() => {})}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { padding: 16, gap: 12 },
  bloque: { gap: 2 },
  destacado: { padding: 20, gap: 6, borderRadius: 28, backgroundColor: colores.primario },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colores.blanco,
  },
  textoChip: { fontFamily: fuentes.extra, fontSize: 15, lineHeight: 20, color: colores.texto },
  dosis: { fontFamily: fuentes.extra, fontSize: 26, lineHeight: 32, color: colores.texto },
  otro: {
    minHeight: 64,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 14,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colores.menta,
  },
  comprobar: {
    padding: 18,
    gap: 12,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colores.bordeSuave,
  },
  fila: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  margen: { marginHorizontal: 8 },
  flex: { flex: 1 },
  pulsado: { opacity: 0.85 },
});
