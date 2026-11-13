import { StyleSheet, Text, View } from "react-native";

export default function farmacos() {
  return (
    <View style={styles.contenedor}>
      <Text>Farmacos</Text>
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