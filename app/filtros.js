import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function filtros({ navigation }) {
  const categorias = [
    "Bar",
    "Restaurante",
    "Balada",
    "Lanchonete",
    "Food Truck",
  ];

  const [selecionados, setSelecionados] = useState([]);

  function toggleFiltro(item) {
    if (selecionados.includes(item)) {
      setSelecionados(selecionados.filter((f) => f !== item));
    } else {
      setSelecionados([...selecionados, item]);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Filtros</Text>

      <ScrollView style={styles.lista}>
        {categorias.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.item}
            onPress={() => toggleFiltro(item)}
          >
            <View style={styles.checkbox}>
              {selecionados.includes(item) && <View style={styles.checked} />}
            </View>

            <Text style={styles.textoItem}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.btnAplicar}
        onPress={() => {
          // 👇 Envie o resultado para a tela anterior (ex: Mapa)
          navigation.navigate("Mapa", { filtros: selecionados });
        }}
      >
        <Text style={styles.btnTexto}>Aplicar Filtros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 20,
  },
  lista: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checked: {
    width: 16,
    height: 16,
    backgroundColor: "#333",
    borderRadius: 4,
  },
  textoItem: {
    fontSize: 18,
  },
  btnAplicar: {
    backgroundColor: "#333",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 30,
  },
  btnTexto: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
});
