import { StyleSheet, Text, View } from "react-native";

export default function escalas() {
  return (
    <View style={styles.contenedor}>
      <Text>Escalas</Text>
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