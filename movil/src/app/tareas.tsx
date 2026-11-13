import { StyleSheet, Text, View } from "react-native";

export default function tareas() {
  return (
    <View style={styles.contenedor}>
      <Text>Tareas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});