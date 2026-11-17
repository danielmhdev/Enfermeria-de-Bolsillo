import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { EscalaRepositorio } from "@/datos/escala-repositorio";
import { Escala } from "@/dominio/escala";
import { colores } from "@/tema/colores";

export default function PantallaEscalas() {
  const db = useSQLiteContext();

  const [escalas, setEscalas] = useState<Escala[]>([]);

  useEffect(() => {
    new EscalaRepositorio(db).todas().then(setEscalas);
  }, [db]);

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
      data={escalas}
      keyExtractor={(escala) => escala.codigo}
      renderItem={({ item }) => (
        <Link href={`/escalas/${item.codigo}`} asChild>
          <Pressable style={styles.fila}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.detalle}>
              {item.definicion.items.length} ítems
            </Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedor: {
    padding: 16,
    gap: 8,
  },
  fila: {
    minHeight: 48,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colores.superficie,
  },
  nombre: {
    color: colores.texto,
    fontSize: 16,
  },
  detalle: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
});
