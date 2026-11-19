import { useCallback, useEffect, useState } from "react";
import { AppState, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSQLiteContext } from "expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvisoLegal } from "@/componentes/aviso-legal";
import { Texto } from "@/componentes/texto";
import { AjusteRepositorio } from "@/datos/ajuste-repositorio";
import { limpiarTurnoCaducado } from "@/datos/base-datos";
import { sincronizar } from "@/datos/sincronizacion";
import { TareaRepositorio } from "@/datos/tarea-repositorio";
import { formatearEspera, proximaAlerta, Tarea } from "@/dominio/tarea";
import { contar } from "@/dominio/texto";
import { colores } from "@/tema/colores";
import { useMargenInferior } from "@/tema/margenes";

const SECCIONES: { ruta: Href; nombre: string; icono: keyof typeof Ionicons.glyphMap }[] = [
  { ruta: "/calculadora", nombre: "Calculadora", icono: "calculator-outline" },
  { ruta: "/farmacos", nombre: "Fármacos", icono: "medkit-outline" },
  { ruta: "/escalas", nombre: "Escalas", icono: "pulse-outline" },
  { ruta: "/guia", nombre: "Guía de curas", icono: "bandage-outline" },
];

// La primera vez muestra el aviso legal; después, el menú.
export default function PantallaInicio() {
  const db = useSQLiteContext();
  const margenes = useSafeAreaInsets();
  const margenInferior = useMargenInferior();

  // null mientras se consulta la base de datos.
  const [aceptado, setAceptado] = useState<boolean | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);

  useEffect(() => {
    new AjusteRepositorio(db)
      .leer("aviso_aceptado_en")
      .then((valor) => setAceptado(valor !== null));
    sincronizar(db);
  }, [db]);

  // Al volver a la app desde segundo plano se comprueba otra vez la regla
  // de 12 h, aunque se esté en el Inicio (R06F03T02).
  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", async (estado) => {
      if (estado === "active") {
        await limpiarTurnoCaducado(db);
        setTareas(await new TareaRepositorio(db).todas());
      }
    });
    return () => suscripcion.remove();
  }, [db]);

  // El Inicio no se desmonta al abrir una sección: se recarga cada vez que vuelve delante.
  useFocusEffect(
    useCallback(() => {
      new TareaRepositorio(db).todas().then(setTareas);
    }, [db]),
  );

  // Guarda la fecha de aceptación (R11F03T01).
  async function aceptar() {
    await new AjusteRepositorio(db).guardar("aviso_aceptado_en", new Date().toISOString());
    setAceptado(true);
  }

  if (aceptado === null) {
    return null;
  }
  if (!aceptado) {
    return <AvisoLegal alAceptar={aceptar} />;
  }

  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  const ahora = new Date();
  const proxima = proximaAlerta(tareas, ahora);
  const minutos = proxima?.minutosHastaAlerta(ahora) ?? null;

  let resumen = "No tienes tareas pendientes.";
  if (proxima !== null && minutos !== null) {
    resumen = `Próximo aviso en ${formatearEspera(minutos)}: ${proxima.texto}`;
  } else if (pendientes > 0) {
    resumen = "Ninguna tiene aviso.";
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={[
        styles.contenedor,
        { paddingTop: margenes.top + 16, paddingBottom: margenInferior + 16 },
      ]}
    >
      <View style={styles.cabecera}>
        <Image
          style={styles.logo}
          source={require("@/assets/images/logo.png")}
          resizeMode="contain"
          accessibilityLabel="Enfermería de Bolsillo"
        />
        <Texto variante="titulo" accessibilityRole="header">
          Buen turno
        </Texto>
        <Texto variante="subtitulo">¿Qué necesitas ahora?</Texto>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/tareas")}
        style={({ pressed }) => [styles.tareas, pressed && styles.pulsado]}
      >
        <View style={styles.filaTareas}>
          <Texto variante="seccion">Tareas</Texto>
          <View style={styles.contador}>
            <Texto variante="etiqueta">
              {contar(pendientes, "pendiente", "pendientes")}
            </Texto>
          </View>
        </View>
        <Texto>{resumen}</Texto>
      </Pressable>

      {SECCIONES.map((seccion) => (
        <Pressable
          key={seccion.nombre}
          accessibilityRole="button"
          onPress={() => router.push(seccion.ruta)}
          style={({ pressed }) => [styles.seccion, pressed && styles.pulsado]}
        >
          <View style={styles.icono}>
            <Ionicons name={seccion.icono} size={24} color={colores.acento} />
          </View>
          <Texto variante="seccion" style={styles.nombre}>
            {seccion.nombre}
          </Texto>
          <Ionicons name="chevron-forward" size={22} color={colores.acento} />
        </Pressable>
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={() => setAceptado(false)}
        style={styles.enlace}
      >
        <Texto variante="etiqueta" style={styles.enlaceTexto}>
          Aviso legal
        </Texto>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.blanco },
  contenedor: { flexGrow: 1, paddingHorizontal: 16, gap: 10 },
  cabecera: { paddingHorizontal: 8, marginBottom: 40, gap: 4 },
  // Misma proporción que la imagen (892 x 461).
  logo: {
    height: 48,
    width: undefined,
    aspectRatio: 892 / 461,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  tareas: { padding: 18, gap: 12, borderRadius: 28, backgroundColor: colores.primario },
  filaTareas: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contador: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colores.blanco,
  },
  seccion: {
    minHeight: 72,
    paddingLeft: 12,
    paddingRight: 18,
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colores.menta,
  },
  icono: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.blanco,
  },
  nombre: { flex: 1 },
  pulsado: { opacity: 0.85 },
  enlace: { minHeight: 48, alignSelf: "center", justifyContent: "center", paddingHorizontal: 12 },
  enlaceTexto: { color: colores.acento },
});
