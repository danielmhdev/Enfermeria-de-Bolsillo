import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { FarmacoRepositorio } from "@/datos/farmaco-repositorio";
import { Farmaco } from "@/dominio/farmaco";
import { colores } from "@/tema/colores";

export default function Farmacos() {
  // La base de datos que abrió SQLiteProvider en _layout.tsx.
  const db = useSQLiteContext();

  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Farmaco[]>([]);

  // Cada vez que cambia el texto se vuelve a buscar (resultados mientras se escribe).
  useEffect(() => {
    new FarmacoRepositorio(db).buscar(texto).then(setResultados);
  }, [db, texto]);

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenedor}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      data={resultados}
      keyExtractor={(farmaco) => String(farmaco.id)}
      ListHeaderComponent={
        <TextInput
          style={styles.buscador}
          value={texto}
          onChangeText={setTexto}
          placeholder="Buscar fármaco"
          placeholderTextColor={colores.textoSecundario}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      }
      ListEmptyComponent={
        <Text style={styles.vacio}>No hay fármacos con ese nombre.</Text>
      }
      renderItem={({ item }) => (
        // Al tocar la fila se abre el detalle del fármaco: /farmacos/3.
        <Link href={`/farmacos/${item.id}`} asChild>
          <Pressable style={styles.fila}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.detalle}>
              {item.rangos.length === 1 ? "1 rango" : `${item.rangos.length} rangos`}
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
  buscador: {
    minHeight: 48,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: 16,
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
  vacio: {
    color: colores.textoSecundario,
    fontSize: 16,
  },
});
