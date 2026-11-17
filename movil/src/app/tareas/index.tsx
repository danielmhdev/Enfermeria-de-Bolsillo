import { useEffect, useState } from "react";
import {
  Alert,
  AppState,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { limpiarTurnoCaducado } from "@/datos/base-datos";
import {
  cancelarAlerta,
  cancelarTodasLasAlertas,
  pedirPermiso,
  programarAlerta,
} from "@/datos/alertas";
import { TareaRepositorio } from "@/datos/tarea-repositorio";
import { LONGITUD_MAXIMA, Tarea, validarTexto, type Prioridad } from "@/dominio/tarea";
import { colores } from "@/tema/colores";

// 0 minutos es «sin alerta».
const ALERTAS = [
  { minutos: 0, texto: "Sin alerta" },
  { minutos: 30, texto: "30 min" },
  { minutos: 60, texto: "1 h" },
  { minutos: 120, texto: "2 h" },
];

export default function PantallaTareas() {
  const db = useSQLiteContext();
  const repositorio = new TareaRepositorio(db);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [texto, setTexto] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("normal");
  const [minutosAlerta, setMinutosAlerta] = useState(0);
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
      if (minutosAlerta > 0) {
        const permitido = await pedirPermiso();
        if (!permitido) {
          setError("Activa las notificaciones en Ajustes para usar las alertas.");
          return;
        }
        horaAlerta = new Date(Date.now() + minutosAlerta * 60 * 1000);
        notificacionId = await programarAlerta(horaAlerta);
      }

      await repositorio.crear(texto, prioridad, horaAlerta, notificacionId);
      setTexto("");
      setPrioridad("normal");
      setMinutosAlerta(0);
      setError("");
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

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      data={tareas}
      keyExtractor={(tarea) => String(tarea.id)}
      ListHeaderComponent={
        <View style={styles.formulario}>
          {/* Aviso de privacidad (R06F01T02). */}
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>
              ⚠ No escribas datos de pacientes: ni nombres, ni camas, ni números de historia.
            </Text>
          </View>

          <TextInput
            style={styles.entrada}
            value={texto}
            onChangeText={setTexto}
            placeholder="Nueva tarea"
            placeholderTextColor={colores.textoSecundario}
            maxLength={LONGITUD_MAXIMA}
          />

          <View style={styles.selector}>
            <Pressable
              style={[styles.opcion, prioridad === "normal" && styles.opcionActiva]}
              onPress={() => setPrioridad("normal")}
            >
              <Text style={styles.opcionTexto}>Normal</Text>
            </Pressable>
            <Pressable
              style={[styles.opcion, prioridad === "alta" && styles.opcionActiva]}
              onPress={() => setPrioridad("alta")}
            >
              <Text style={styles.opcionTexto}>Alta</Text>
            </Pressable>
          </View>

          {/* Alerta local con texto genérico (R06F02T01). */}
          <View style={styles.selector}>
            {ALERTAS.map((alerta) => (
              <Pressable
                key={alerta.minutos}
                style={[styles.opcion, minutosAlerta === alerta.minutos && styles.opcionActiva]}
                onPress={() => setMinutosAlerta(alerta.minutos)}
              >
                <Text style={styles.opcionTexto}>{alerta.texto}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.boton} onPress={anadir}>
            <Text style={styles.botonTexto}>Añadir tarea</Text>
          </Pressable>

          {error !== "" && (
            <View style={styles.error}>
              <Text style={styles.errorTexto}>{error}</Text>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={<Text style={styles.vacio}>No hay tareas en este turno.</Text>}
      ListFooterComponent={
        tareas.length > 0 ? (
          <Pressable style={styles.terminar} onPress={terminarTurno}>
            <Text style={styles.terminarTexto}>Terminar turno</Text>
          </Pressable>
        ) : undefined
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.fila}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completada }}
          onPress={() => marcar(item)}
        >
          <Text style={styles.casilla}>{item.completada ? "☑" : "☐"}</Text>
          <Text style={[styles.tareaTexto, item.completada && styles.tareaHecha]}>
            {item.texto}
          </Text>
          {item.horaAlerta !== null && !item.completada && (
            <Text style={styles.hora}>
              ⏰ {item.horaAlerta.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          )}
          {item.prioridad === "alta" && <Text style={styles.alta}>Alta</Text>}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { padding: 16, gap: 8 },
  formulario: { gap: 8, marginBottom: 8 },
  aviso: { padding: 12, borderRadius: 8, backgroundColor: colores.avisoFondo },
  avisoTexto: { color: colores.avisoTexto, fontSize: 16 },
  entrada: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: 16,
  },
  selector: { flexDirection: "row", gap: 8 },
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
  opcionActiva: { backgroundColor: colores.primario, borderWidth: 2, borderColor: colores.acento },
  opcionTexto: { color: colores.texto, fontSize: 16 },
  boton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colores.primario,
  },
  botonTexto: { color: colores.texto, fontSize: 16, fontWeight: "600" },
  error: { padding: 12, borderRadius: 8, backgroundColor: colores.errorFondo },
  errorTexto: { color: colores.errorTexto, fontSize: 16 },
  vacio: { color: colores.textoSecundario, fontSize: 16 },
  fila: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colores.superficie,
  },
  casilla: { color: colores.texto, fontSize: 22 },
  tareaTexto: { flex: 1, color: colores.texto, fontSize: 16 },
  tareaHecha: { color: colores.textoSecundario, textDecorationLine: "line-through" },
  hora: { color: colores.textoSecundario, fontSize: 14 },
  alta: { color: colores.acento, fontSize: 14, fontWeight: "600" },
  terminar: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colores.errorFondo,
  },
  terminarTexto: { color: colores.errorTexto, fontSize: 16, fontWeight: "600" },
});
