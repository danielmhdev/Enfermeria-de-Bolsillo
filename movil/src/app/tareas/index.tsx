import { useEffect, useState } from "react";
import {
  Alert,
  AppState,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { Boton } from "@/componentes/boton";
import { Cabecera } from "@/componentes/cabecera";
import { Mensaje } from "@/componentes/mensaje";
import { Opcion } from "@/componentes/opcion";
import { Pie } from "@/componentes/pie";
import { Texto } from "@/componentes/texto";
import {
  cancelarAlerta,
  cancelarTodasLasAlertas,
  pedirPermiso,
  programarAlerta,
} from "@/datos/alertas";
import { limpiarTurnoCaducado } from "@/datos/base-datos";
import { TareaRepositorio } from "@/datos/tarea-repositorio";
import {
  formatearEspera,
  LONGITUD_MAXIMA,
  proximaHora,
  Tarea,
  validarTexto,
  type Prioridad,
} from "@/dominio/tarea";
import { aNumero } from "@/dominio/numeros";
import { colores } from "@/tema/colores";
import { fuentes } from "@/tema/fuentes";

// 0 minutos es «sin alerta»; A_UNA_HORA, una hora del reloj escrita a mano.
const A_UNA_HORA = -1;
const ALERTAS = [
  { minutos: 0, texto: "Sin alerta" },
  { minutos: 15, texto: "15 min" },
  { minutos: 30, texto: "30 min" },
  { minutos: 60, texto: "1 h" },
  { minutos: 120, texto: "2 h" },
  { minutos: 240, texto: "4 h" },
  { minutos: A_UNA_HORA, texto: "A una hora…" },
];

// «Prioridad alta · te aviso en 25 min», «Te aviso en 1 h» o null.
function detalle(tarea: Tarea, ahora: Date): string | null {
  const partes: string[] = [];
  if (tarea.prioridad === "alta") {
    partes.push("Prioridad alta");
  }
  if (tarea.alertaPendiente(ahora)) {
    const minutos = Math.ceil((tarea.horaAlerta!.getTime() - ahora.getTime()) / 60000);
    partes.push(`te aviso en ${formatearEspera(minutos)}`);
  }
  if (partes.length === 0) {
    return null;
  }
  const texto = partes.join(" · ");
  return texto[0].toUpperCase() + texto.slice(1);
}

export default function PantallaTareas() {
  const db = useSQLiteContext();
  const repositorio = new TareaRepositorio(db);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [texto, setTexto] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("normal");
  const [minutosAlerta, setMinutosAlerta] = useState(0);
  const [hora, setHora] = useState("");
  const [minuto, setMinuto] = useState("");
  // El formulario de nueva tarea se despliega desde abajo.
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const repositorio = new TareaRepositorio(db);
    async function cargar() {
      await limpiarTurnoCaducado(db);
      setTareas(await repositorio.todas());
    }
    cargar();
    // Al volver a la app desde segundo plano.
    const suscripcion = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        cargar();
      }
    });
    return () => suscripcion.remove();
  }, [db]);

  async function recargar() {
    setTareas(await repositorio.todas());
  }

  async function anadir() {
    try {
      // Se valida antes de programar la alerta.
      validarTexto(texto);

      let horaAlerta: Date | null = null;
      let notificacionId: string | null = null;
      if (minutosAlerta !== 0) {
        // La hora escrita se comprueba antes de pedir permiso. El minuto vacío es 0.
        horaAlerta =
          minutosAlerta === A_UNA_HORA
            ? proximaHora(aNumero(hora), minuto.trim() === "" ? 0 : aNumero(minuto), new Date())
            : new Date(Date.now() + minutosAlerta * 60 * 1000);
        const permitido = await pedirPermiso();
        if (!permitido) {
          setError("Activa las notificaciones en Ajustes para usar las alertas.");
          return;
        }
        notificacionId = await programarAlerta(horaAlerta);
      }

      await repositorio.crear(texto, prioridad, horaAlerta, notificacionId);
      setTexto("");
      setPrioridad("normal");
      setMinutosAlerta(0);
      setHora("");
      setMinuto("");
      setError("");
      setAbierto(false);
      Keyboard.dismiss();
      await recargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function marcar(tarea: Tarea) {
    if (!tarea.completada) {
      // Una tarea hecha ya no necesita avisar.
      if (tarea.notificacionId !== null) {
        await cancelarAlerta(tarea.notificacionId);
      }
      await repositorio.marcar(tarea.id, true, null);
    } else {
      // Al desmarcarla, su alerta vuelve si aún no ha pasado la hora.
      const notificacionId = tarea.alertaPendiente(new Date())
        ? await programarAlerta(tarea.horaAlerta!)
        : null;
      await repositorio.marcar(tarea.id, false, notificacionId);
    }
    await recargar();
  }

  // Mantener pulsada una tarea la borra (R06F01).
  function borrar(tarea: Tarea) {
    Alert.alert("Borrar tarea", tarea.texto, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          if (tarea.notificacionId !== null) {
            await cancelarAlerta(tarea.notificacionId);
          }
          await repositorio.borrar(tarea.id);
          await recargar();
        },
      },
    ]);
  }

  // Pide confirmación antes de borrar (R06F03T01).
  function terminarTurno() {
    Alert.alert("Terminar turno", "Se borrarán todas las tareas y sus alertas.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          await repositorio.borrarTodas();
          await cancelarTodasLasAlertas();
          await recargar();
        },
      },
    ]);
  }

  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  const hechas = tareas.length - pendientes;
  const ahora = new Date();

  return (
    // En iOS sube el formulario por encima del teclado.
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Cabecera
        titulo="Tareas"
        subtitulo={`${pendientes} por hacer · ${hechas} ${hechas === 1 ? "hecha" : "hechas"}`}
        derecha={
          tareas.length > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={terminarTurno}
              style={({ pressed }) => [styles.terminar, pressed && styles.pulsado]}
            >
              <Text style={styles.terminarTexto}>Terminar turno</Text>
            </Pressable>
          )
        }
      />

      <FlatList
        contentContainerStyle={styles.contenedor}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        data={tareas}
        keyExtractor={(tarea) => String(tarea.id)}
        ListEmptyComponent={
          <Texto variante="nota" style={styles.margen}>
            No hay tareas en este turno.
          </Texto>
        }
        ListFooterComponent={
          tareas.length > 0 ? (
            <Texto variante="nota" style={styles.margen}>
              Mantén pulsada una tarea para borrarla.
            </Texto>
          ) : undefined
        }
        renderItem={({ item }) => {
          const alta = item.prioridad === "alta" && !item.completada;
          const linea = item.completada ? null : detalle(item, ahora);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.completada }}
              accessibilityHint="Mantén pulsado para borrarla"
              onPress={() => marcar(item)}
              onLongPress={() => borrar(item)}
              style={({ pressed }) => [
                styles.fila,
                !item.completada && styles.filaPendiente,
                alta && styles.filaAlta,
                pressed && styles.pulsado,
              ]}
            >
              <View
                style={[
                  styles.casilla,
                  alta && styles.casillaAlta,
                  item.completada && styles.casillaHecha,
                ]}
              >
                {item.completada && <Ionicons name="checkmark" size={18} color={colores.blanco} />}
              </View>
              <View style={styles.flex}>
                <Text style={[styles.tareaTexto, item.completada && styles.tareaHecha]}>
                  {item.texto}
                </Text>
                {linea !== null && (
                  <Texto variante="nota" style={alta && styles.textoAlta}>
                    {linea}
                  </Texto>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <Pie menta>
        {abierto ? (
          // Si con el teclado no cabe todo, el formulario se desplaza.
          <ScrollView
            style={styles.formulario}
            contentContainerStyle={styles.formularioContenido}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.filaTitulo}>
              <Texto variante="etiqueta" style={styles.flex}>
                Nueva tarea
              </Texto>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar sin añadir"
                onPress={() => {
                  setAbierto(false);
                  setError("");
                  Keyboard.dismiss();
                }}
                style={styles.cerrar}
              >
                <Ionicons name="chevron-down" size={22} color={colores.acento} />
              </Pressable>
            </View>

            <View style={styles.opciones}>
              <Opcion
                compacta
                texto="Prioridad alta"
                seleccionada={prioridad === "alta"}
                alPulsar={() => setPrioridad(prioridad === "alta" ? "normal" : "alta")}
              />
            </View>

            {/* Alerta local con texto genérico (R06F02T01). */}
            <Texto variante="nota">Avisarme</Texto>
            <View style={styles.opciones}>
              {ALERTAS.map((alerta) => (
                <Opcion
                  compacta
                  key={alerta.minutos}
                  texto={alerta.texto}
                  seleccionada={minutosAlerta === alerta.minutos}
                  alPulsar={() => setMinutosAlerta(alerta.minutos)}
                />
              ))}
            </View>

            {minutosAlerta === A_UNA_HORA && (
              <View style={styles.filaHora}>
                {/* Este teclado numérico tiene tecla «Hecho» para cerrarlo. */}
                <TextInput
                  style={styles.hora}
                  value={hora}
                  onChangeText={setHora}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  maxLength={2}
                  placeholder="hh"
                  placeholderTextColor={colores.textoSecundario}
                  accessibilityLabel="Hora del aviso"
                />
                <Texto variante="etiqueta">:</Texto>
                <TextInput
                  style={styles.hora}
                  value={minuto}
                  onChangeText={setMinuto}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  maxLength={2}
                  placeholder="mm"
                  placeholderTextColor={colores.textoSecundario}
                  accessibilityLabel="Minutos del aviso"
                />
              </View>
            )}

            {error !== "" && <Mensaje tipo="error">{error}</Mensaje>}

            {/* El texto va al final, justo encima del teclado. */}
            <View style={styles.filaTitulo}>
              <TextInput
                style={[styles.entrada, styles.flex]}
                value={texto}
                onChangeText={setTexto}
                placeholder="Escribe una tarea…"
                placeholderTextColor={colores.textoSecundario}
                maxLength={LONGITUD_MAXIMA}
                accessibilityLabel="Nueva tarea"
                returnKeyType="done"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Añadir tarea"
                onPress={anadir}
                style={({ pressed }) => [styles.anadir, pressed && styles.pulsado]}
              >
                <Ionicons name="add" size={26} color={colores.texto} />
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <Boton texto="Nueva tarea" icono="add" alPulsar={() => setAbierto(true)} />
        )}

        {/* Aviso de privacidad (R06F01T02). */}
        <Texto variante="nota" style={styles.aviso}>
          No escribas datos de pacientes: ni nombres, ni camas, ni números de historia.
        </Texto>
      </Pie>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { padding: 16, paddingBottom: 24, gap: 10 },
  margen: { marginHorizontal: 8 },
  terminar: {
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colores.errorTexto,
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  terminarTexto: { fontFamily: fuentes.extra, fontSize: 16, color: colores.errorTexto },
  fila: {
    minHeight: 64,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 16,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  filaPendiente: { backgroundColor: colores.menta },
  filaAlta: { backgroundColor: colores.errorFondo },
  pulsado: { opacity: 0.85 },
  casilla: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: colores.acento,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  casillaAlta: { borderColor: colores.errorTexto },
  casillaHecha: { borderColor: colores.acento, backgroundColor: colores.acento },
  flex: { flex: 1, gap: 2 },
  tareaTexto: { fontFamily: fuentes.extra, fontSize: 17, lineHeight: 23, color: colores.texto },
  tareaHecha: {
    fontFamily: fuentes.normal,
    color: colores.textoSecundario,
    textDecorationLine: "line-through",
  },
  textoAlta: { color: colores.errorTexto },
  opciones: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filaTitulo: { flexDirection: "row", alignItems: "center", gap: 8 },
  cerrar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  entrada: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    fontFamily: fuentes.normal,
    fontSize: 16,
    color: colores.texto,
  },
  filaHora: { flexDirection: "row", alignItems: "center", gap: 8 },
  formulario: { flexShrink: 1 },
  formularioContenido: { gap: 10 },
  anadir: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.primario,
  },
  hora: {
    width: 64,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colores.borde,
    backgroundColor: colores.blanco,
    textAlign: "center",
    fontFamily: fuentes.extra,
    fontSize: 18,
    color: colores.texto,
  },
  aviso: { color: colores.avisoTexto, fontSize: 13, lineHeight: 18, marginHorizontal: 6 },
});
