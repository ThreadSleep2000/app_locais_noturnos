import React from "react";
import { View, Text, StyleSheet, TextInput, ImageBackground, TouchableOpacity } from "react-native";
import { router } from 'expo-router';

export default function Map() {
  return (
    <View style={styles.container}>

      {/* IMAGEM DO MAPA */}
      <ImageBackground
        source={require("../assets/images/mapa.png")}
        style={styles.mapa}
      >

        {/* BARRA DE BUSCA SOBRE O MAPA */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Buscar local..."
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
        </View>

        {/* BOTÕES NO CANTO INFERIOR DIREITO */}
        <View style={styles.botoesContainer}>

          <TouchableOpacity 
            style={[styles.botao, styles.filtrosButton]}
            onPress={() => router.push('/filtros')}
          >
            <Text style={styles.botaoTexto}>Filtros</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.botao, styles.detalhesButton]}
            onPress={() => router.push('/localDetails')}
          >
            <Text style={styles.botaoTexto}>Detalhes</Text>
          </TouchableOpacity>

        </View>  

      </ImageBackground>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapa: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  // Barra de Busca
  searchBox: {
    position: "absolute",
    top: 50,
    width: "90%",
    alignSelf: "center",
  },
  searchInput: {
    height: 45,
    borderRadius: 10,
    backgroundColor: "white",
    paddingHorizontal: 15,
    fontSize: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  // Botões
  botoesContainer: {
    position: "absolute",
    bottom: 40,
    right: 20,
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
  },
  botao: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    opacity: 0.85,
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
  },

  filtrosButton: {
    backgroundColor: "#4A90E2",
  },
  detalhesButton: {
    backgroundColor: "#50E3C2",
  },
});
