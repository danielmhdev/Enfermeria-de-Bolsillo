import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { Cabecera } from "@/componentes/cabecera";
import { Texto } from "@/componentes/texto";
import { FarmacoRepositorio } from "@/datos/farmaco-repositorio";
import { Farmaco, type Via } from "@/dominio/farmaco";
import { contar, partirCoincidencia } from "@/dominio/texto";
import { colores } from "@/tema/colores";
import { useMargenInferior } from "@/tema/margenes";
import { fuentes } from "@/tema/fuentes";

// Todas las vías, aunque alguna todavía no tenga fármacos.
const VIAS: Via[] = ["IV", "VO", "SC", "IM"];

const NOMBRES_VIA: Record<Via, string> = {
  IV: "intravenosa",
  VO: "oral",
  SC: "subcutánea",
  IM: "intramuscular",
};

// «Intravenosa · 2 rangos según peso»: vías sin repetir, número de rangos
// y si alguno depende del peso.
function resumen(farmaco: Farmaco): string {
  const vias = [...new Set(farmaco.rangos.map((rango) => rango.via))]
    .map((via) => NOMBRES_VIA[via])
    .join(", ");
  const rangos = contar(farmaco.rangos.length, "rango", "rangos");
  const segunPeso = farmaco.dependeDelPeso();
  return `${vias.charAt(0).toUpperCase()}${vias.slice(1)} · ${rangos}${segunPeso ? " según peso" : ""}`;
}

// El nombre con lo buscado resaltado en menta fuerte.
function Nombre({ nombre, busqueda }: { nombre: string; busqueda: string }) {
  const trozos = partirCoincidencia(nombre, busqueda);
  if (trozos === null) {
    return <Texto variante="seccion">{nombre}</Texto>;
  }
  const [antes, coincide, despues] = trozos;
  return (
    <Texto variante="seccion">
      {antes}
      <Text style={styles.resaltado}>{coincide}</Text>
      {despues}
    </Texto>
  );
}

export default function PantallaFarmacos() {
  const db = useSQLiteContext();
  const margenInferior = useMargenInferior();

  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Farmaco[]>([]);
  // null = todas.
  const [via, setVia] = useState<Via | null>(null);
  const [abierto, setAbierto] = useState(false);

  function elegirVia(nueva: Via | null) {
    setVia(nueva);
    setAbierto(false);
  }

  // Busca mientras se escribe.
  useEffect(() => {
    new FarmacoRepositorio(db).buscar(texto).then(setResultados);
  }, [db, texto]);

  // El filtro se aplica sobre los resultados de la búsqueda.
  const visibles = via === null ? resultados : resultados.filter((f) => f.tieneVia(via));
  const filtrando = texto !== "" || via !== null;

  return (
    <View style={styles.pantalla}>
      <Cabecera titulo="Fármacos" />

      <FlatList
        contentContainerStyle={[styles.contenedor, { paddingBottom: margenInferior + 16 }]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        data={visibles}
        keyExtractor={(farmaco) => String(farmaco.id)}
        ListHeaderComponent={
          <View style={styles.cabeceraLista}>
            <View style={styles.buscador}>
              <Ionicons name="search" size={22} color={colores.acento} />
              <TextInput
                style={styles.entrada}
                value={texto}
                onChangeText={setTexto}
                placeholder="Buscar fármaco"
                placeholderTextColor={colores.textoSecundario}
                autoCorrect={false}
                accessibilityLabel="Buscar fármaco"
              />
              {texto !== "" && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Borrar búsqueda"
                  onPress={() => setTexto("")}
                  style={styles.borrar}
                >
                  <Ionicons name="close" size={20} color={colores.acento} />
                </Pressable>
              )}
            </View>

            {/* Desplegable con aspecto de campo: se abre al tocarlo y se cierra al elegir. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Vía: ${via === null ? "todas" : NOMBRES_VIA[via]}`}
              accessibilityState={{ expanded: abierto }}
              onPress={() => setAbierto(!abierto)}
              style={({ pressed }) => [
                styles.selector,
                abierto && styles.selectorAbierto,
                pressed && styles.pulsado,
              ]}
            >
              <Texto variante="nota">Vía</Texto>
              <Texto variante="etiqueta" style={styles.flex}>
                {via === null ? "Todas" : `${via} · ${NOMBRES_VIA[via]}`}
              </Texto>
              <View style={styles.flecha}>
                <Ionicons
                  name={abierto ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colores.acento}
                />
              </View>
            </Pressable>
            {abierto && (
              <View style={styles.menu}>
                {[null, ...VIAS].map((v, i) => {
                  const elegida = via === v;
                  return (
                    <Pressable
                      key={v ?? "todas"}
                      accessibilityRole="button"
                      accessibilityState={{ selected: elegida }}
                      onPress={() => elegirVia(v)}
                      style={({ pressed }) => [
                        styles.opcionMenu,
                        i > 0 && styles.separador,
                        elegida && styles.opcionElegida,
                        pressed && styles.pulsado,
                      ]}
                    >
                      <Texto variante={elegida ? "etiqueta" : "cuerpo"} style={styles.flex}>
                        {v === null ? "Todas" : `${v} · ${NOMBRES_VIA[v]}`}
                      </Texto>
                      {elegida && <Ionicons name="checkmark" size={22} color={colores.texto} />}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {filtrando && (
              <Texto variante="nota" style={styles.margen}>
                {contar(visibles.length, "resultado", "resultados")}
              </Texto>
            )}
          </View>
        }
        ListEmptyComponent={
          <Texto variante="nota" style={styles.margen}>
            No hay fármacos que cumplan la búsqueda.
          </Texto>
        }
        ListFooterComponent={
          <Texto variante="nota" style={styles.margen}>
            Busca por principio activo o por la marca que va entre paréntesis, como «Nolotil». Da
            igual escribir con o sin tildes.
          </Texto>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/farmacos/${item.id}`)}
            style={({ pressed }) => [styles.fila, pressed && styles.pulsado]}
          >
            <View style={styles.flex}>
              <Nombre nombre={item.nombre} busqueda={texto} />
              <Texto variante="nota">{resumen(item)}</Texto>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colores.acento} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { padding: 16, gap: 10 },
  cabeceraLista: { gap: 10, marginBottom: 4 },
  buscador: {
    height: 60,
    paddingLeft: 18,
    paddingRight: 6,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colores.acento,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colores.blanco,
  },
  entrada: { flex: 1, fontFamily: fuentes.negrita, fontSize: 19, color: colores.texto },
  borrar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.menta,
  },
  selector: {
    height: 60,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colores.borde,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colores.blanco,
  },
  selectorAbierto: { borderColor: colores.acento },
  flecha: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.menta,
  },
  menu: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colores.bordeSuave,
    overflow: "hidden",
    backgroundColor: colores.blanco,
  },
  opcionMenu: {
    minHeight: 52,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  separador: { borderTopWidth: 1, borderTopColor: colores.bordeSuave },
  opcionElegida: { backgroundColor: colores.primario },
  margen: { marginHorizontal: 8 },
  fila: {
    minHeight: 72,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 18,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colores.menta,
  },
  resaltado: { backgroundColor: colores.primario },
  flex: { flex: 1 },
  pulsado: { opacity: 0.85 },
});
