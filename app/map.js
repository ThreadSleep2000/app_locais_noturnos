import { Text, View, StyleSheet } from 'react-native';
import { router } from "expo-router";
import { Pressable} from "react-native";


export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});

<Pressable
  onPress={() => router.push("/localDetails")}
  style={{
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "#0066ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 4,
  }}
>
  <Text style={{ color: "#fff", fontSize: 16 }}>Abrir Local</Text>
</Pressable>

