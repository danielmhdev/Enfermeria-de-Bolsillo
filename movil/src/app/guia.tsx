import { StyleSheet, Text, View } from "react-native";

export default function guia() {
  return (
    <View style={styles.contenedor}>
      <Text>Guía</Text>
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