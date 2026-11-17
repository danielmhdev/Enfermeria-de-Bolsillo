import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Stack from "expo-router/stack";
import { useSQLiteContext } from "expo-sqlite";
import { ComprobarDosis } from "@/componentes/comprobar-dosis";
import { FarmacoRepositorio } from "@/datos/farmaco-repositorio";
import { Farmaco, RangoDosis } from "@/dominio/farmaco";
import { formatear } from "@/dominio/numeros";
import { colores } from "@/tema/colores";

// "400-1.000 mg" o "1-1,5 mg/kg".
function textoDosis(rango: RangoDosis): string {
  const unidad = rango.tipo === "por_kg" ? "mg/kg" : "mg";
  if (rango.dosisMin === rango.dosisMax) {
    return `${formatear(rango.dosisMin)} ${unidad}`;
  }
  return `${formatear(rango.dosisMin)}-${formatear(rango.dosisMax)} ${unidad}`;
}

export default function PantallaFarmaco() {
  // /farmacos/3 da id = "3".
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  const [farmaco, setFarmaco] = useState<Farmaco | null>(null);

  useEffect(() => {
    new FarmacoRepositorio(db).porId(Number(id)).then(setFarmaco);
  }, [db, id]);

  if (farmaco === null) {
    return <View style={styles.pantalla} />;
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      {/* Nombre del fármaco en la cabecera. */}
      <Stack.Screen options={{ title: farmaco.nombre }} />

      {farmaco.rangos.map((rango) => (
        <View key={rango.id} style={styles.rango}>
          <Text style={styles.indicacion}>
            {rango.via} · {rango.indicacion}
          </Text>
          <Text style={styles.dosis}>{textoDosis(rango)}</Text>
          {rango.intervaloH !== null && (
            <Text style={styles.dato}>Cada {formatear(rango.intervaloH)} h</Text>
          )}
          {rango.maxDiario !== null && (
            <Text style={styles.dato}>
              Máximo diario: {formatear(rango.maxDiario)}{" "}
              {rango.tipo === "por_kg" ? "mg/kg" : "mg"}
            </Text>
          )}
          {rango.nota !== null && <Text style={styles.dato}>{rango.nota}</Text>}
          <Text style={styles.fuente}>{rango.fuente}</Text>
          <ComprobarDosis rango={rango} />
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
    gap: 12,
  },
  rango: {
    padding: 12,
    gap: 4,
    borderRadius: 8,
    backgroundColor: colores.superficie,
  },
  indicacion: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  dosis: {
    color: colores.texto,
    fontSize: 24,
    fontWeight: "600",
  },
  dato: {
    color: colores.texto,
    fontSize: 16,
  },
  fuente: {
    color: colores.textoSecundario,
    fontSize: 12,
  },
});
