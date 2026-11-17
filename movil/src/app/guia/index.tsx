import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { GuiaRepositorio } from "@/datos/guia-repositorio";
import { Guia } from "@/dominio/guia";
import { colores } from "@/tema/colores";

export default function PantallaGuias() {
  const db = useSQLiteContext();

  const [guias, setGuias] = useState<Guia[]>([]);

  useEffect(() => {
    new GuiaRepositorio(db).todas().then(setGuias);
  }, [db]);

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
      data={guias}
      keyExtractor={(guia) => guia.codigo}
      ListEmptyComponent={<Text style={styles.vacio}>Todavía no hay guías.</Text>}
      renderItem={({ item }) => (
        <Link href={`/guia/${item.codigo}`} asChild>
          <Pressable style={styles.fila}>
            <Text style={styles.nombre}>{item.nombre}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { padding: 16, gap: 8 },
  vacio: { color: colores.textoSecundario, fontSize: 16 },
  fila: {
    minHeight: 48,
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: colores.superficie,
  },
  nombre: { color: colores.texto, fontSize: 16 },
});
