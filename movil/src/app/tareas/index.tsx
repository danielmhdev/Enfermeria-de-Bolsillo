import { useEffect, useState } from "react";
import { Alert, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { TareaRepositorio } from "@/datos/tarea-repositorio";
import { LONGITUD_MAXIMA, Tarea, type Prioridad } from "@/dominio/tarea";
import { colores } from "@/tema/colores";

export default function Tareas() {
  const db = useSQLiteContext();
  const repositorio = new TareaRepositorio(db);

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [texto, setTexto] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("normal");
  const [error, setError] = useState("");

  // Las tareas se leen al abrir la pantalla.
  useEffect(() => {
    new TareaRepositorio(db).todas().then(setTareas);
  }, [db]);

  // Vuelve a leer la lista después de cada cambio en la base de datos.
  async function recargar() {
    setTareas(await repositorio.todas());
  }

  async function anadir() {
    try {
      // crear() lanza un error si el texto está vacío o es demasiado largo.
      await repositorio.crear(texto, prioridad);
      setTexto("");
      setPrioridad("normal");
      setError("");
      Keyboard.dismiss();
      await recargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function marcar(tarea: Tarea) {
    await repositorio.marcar(tarea.id, !tarea.completada);
    await recargar();
  }

  // Pide confirmación antes de borrar todas las tareas (R06F03T01).
  function terminarTurno() {
    Alert.alert("Terminar turno", "Se borrarán todas las tareas.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          await repositorio.borrarTodas();
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
        // El botón solo aparece si hay tareas que borrar.
        tareas.length > 0 ? (
          <Pressable style={styles.terminar} onPress={terminarTurno}>
            <Text style={styles.terminarTexto}>Terminar turno</Text>
          </Pressable>
        ) : undefined
      }
      renderItem={({ item }) => (
        // Al tocar la fila se marca o se desmarca la tarea.
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
