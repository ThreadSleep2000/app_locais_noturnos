import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LocalDetails() {
  // Dados de exemplo — depois você pode vir do backend / banco de dados
  const fotos = [
    { id: "1", url: "https://picsum.photos/400/300?1" },
    { id: "2", url: "https://picsum.photos/400/300?2" },
    { id: "3", url: "https://picsum.photos/400/300?3" },
  ];

  const avaliacoes = [
    { id: "1", usuario: "Maria", estrelas: 5, comentario: "Lugar top demais!" },
    { id: "2", usuario: "João", estrelas: 4, comentario: "Bom, mas podia ter mais música." },
    { id: "3", usuario: "Luiza", estrelas: 5, comentario: "Amei o ambiente." },
  ];

  const resumoEstrelas = {
    5: 30,
    4: 10,
    3: 3,
    2: 1,
    1: 0,
  };

  return (
    <View style={styles.overlayContainer}>
      {/* Botão Compartilhar */}
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-social-outline" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Conteúdo principal */}
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Título */}
          <Text style={styles.title}>Bar Neon Night</Text>
          <Text style={styles.subtitle}>Bar • Música • Dança</Text>

          {/* Score */}
          <View style={styles.scoreRow}>
            <Ionicons name="star" size={22} color="#FFD700" />
            <Text style={styles.scoreText}>4.7 • 44 avaliações</Text>
          </View>

          {/* Fotos e Vídeos */}
          <Text style={styles.sectionTitle}>Fotos e Vídeos</Text>

          <FlatList
            horizontal
            data={fotos}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.carouselImage} />
            )}
            style={{ marginBottom: 20 }}
          />

          {/* Resumo das Avaliações */}
          <Text style={styles.sectionTitle}>Resumo das avaliações</Text>

          {Object.keys(resumoEstrelas).reverse().map((estrelas) => (
            <View style={styles.starRow} key={estrelas}>
              <Text style={styles.starLabel}>{estrelas} ⭐</Text>
              <View style={styles.starBarBackground}>
                <View
                  style={[
                    styles.starBarFill,
                    { width: `${resumoEstrelas[estrelas] * 3}%` },
                  ]}
                />
              </View>
            </View>
          ))}

          {/* Comentários */}
          <Text style={styles.sectionTitle}>Avaliações</Text>

          {avaliacoes.map((item) => (
            <View key={item.id} style={styles.commentBox}>
              <Text style={styles.commentUser}>{item.usuario}</Text>
              <Text style={styles.commentStars}>⭐ {item.estrelas}</Text>
              <Text style={styles.commentText}>{item.comentario}</Text>
            </View>
          ))}

          <View style={{ height: 100 }}></View>
        </ScrollView>
      </View>

      {/* Botão Voltar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#111",
    padding: 20,
    height: "80%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },

  subtitle: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 10,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  scoreText: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 8,
  },

  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 15,
  },

  carouselImage: {
    width: 230,
    height: 160,
    borderRadius: 12,
    marginRight: 12,
  },

  starRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  starLabel: {
    color: "#fff",
    width: 50,
  },

  starBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 5,
    overflow: "hidden",
  },

  starBarFill: {
    height: "100%",
    backgroundColor: "#FFD700",
  },

  commentBox: {
    backgroundColor: "#1b1b1b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  commentUser: {
    color: "#fff",
    fontWeight: "700",
  },

  commentStars: {
    color: "#FFD700",
  },

  commentText: {
    color: "#ccc",
    marginTop: 4,
  },

  backButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#0007",
    padding: 10,
    borderRadius: 50,
  },

  shareButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#0007",
    padding: 10,
    borderRadius: 50,
    zIndex: 5,
  },
});
