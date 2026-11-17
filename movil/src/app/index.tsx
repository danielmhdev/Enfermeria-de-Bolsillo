import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, type Href } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { AvisoLegal } from "@/componentes/aviso-legal";
import { AjusteRepositorio } from "@/datos/ajuste-repositorio";
import { colores } from "@/tema/colores";

const SECCIONES: { ruta: Href; nombre: string; detalle: string }[] = [
  { ruta: "/calculadora", nombre: "Calculadora", detalle: "Goteo, dosis y diluciones" },
  { ruta: "/farmacos", nombre: "Fármacos", detalle: "Buscador y comprobación de dosis" },
  { ruta: "/escalas", nombre: "Escalas", detalle: "Escalas de valoración" },
  { ruta: "/guia", nombre: "Guía", detalle: "Guía de curas" },
  { ruta: "/tareas", nombre: "Tareas", detalle: "Tareas del turno y alertas" },
];

// La primera vez muestra el aviso legal; después, el menú.
export default function PantallaInicio() {
  const db = useSQLiteContext();

  // null mientras se consulta la base de datos.
  const [aceptado, setAceptado] = useState<boolean | null>(null);

  useEffect(() => {
    new AjusteRepositorio(db)
      .leer("aviso_aceptado_en")
      .then((valor) => setAceptado(valor !== null));
  }, [db]);

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
          resizeMode="contain"
          accessibilityLabel="Enfermería de Bolsillo"
        />
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
  cabecera: { alignItems: "center", marginVertical: 16 },
  // Misma proporción que la imagen (892 x 461).
  logo: { width: "80%", height: undefined, aspectRatio: 892 / 461 },
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
