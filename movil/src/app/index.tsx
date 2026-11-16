import { Link, type Href } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colores } from "@/tema/colores";

// Secciones de la app. Cada una lleva a su pantalla.
const SECCIONES: { ruta: Href; nombre: string; detalle: string }[] = [
  { ruta: "/calculadora", nombre: "Calculadora", detalle: "Goteo, dosis y diluciones" },
  { ruta: "/farmacos", nombre: "Fármacos", detalle: "Buscador y comprobación de dosis" },
  { ruta: "/escalas", nombre: "Escalas", detalle: "Escalas de valoración" },
  { ruta: "/guia", nombre: "Guía", detalle: "Guía de curas" },
  { ruta: "/tareas", nombre: "Tareas", detalle: "Tareas del turno y alertas" },
];

// Menú de inicio: el logo, el título y un botón grande por cada sección.
export default function PantallaInicio() {
  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.cabecera}>
        <Image
          style={styles.logo}
          source={require("@/assets/images/logo.png")}
          accessibilityLabel="Logo de Enfermería de Bolsillo"
        />
        <Text style={styles.titulo}>Enfermería de Bolsillo</Text>
      </View>

      {SECCIONES.map((seccion) => (
        <Link key={seccion.nombre} href={seccion.ruta} asChild>
          <Pressable style={styles.tarjeta}>
            <Text style={styles.nombre}>{seccion.nombre}</Text>
            <Text style={styles.detalle}>{seccion.detalle}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { padding: 16, gap: 12 },
  cabecera: { alignItems: "center", gap: 12, marginVertical: 16 },
  logo: { width: 96, height: 96 },
  titulo: { color: colores.texto, fontSize: 26, fontWeight: "700" },
  tarjeta: {
    minHeight: 72,
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: colores.primario,
  },
  nombre: { color: colores.texto, fontSize: 20, fontWeight: "600" },
  detalle: { color: colores.texto, fontSize: 14 },
});
