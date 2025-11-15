import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from "react-native";
import { useJsApiLoader, GoogleMap, MarkerF } from "@react-google-maps/api";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { buscarEstabelecimentosNoturnos, buscarPorTexto } from "../services/googlePlaces";

export default function MapWeb() {
  const params = useLocalSearchParams();
  const mapRef = useRef(null);

  const [carregando, setCarregando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [lugares, setLugares] = useState([]);
  const [filtrosAtivos, setFiltrosAtivos] = useState([]);
  const [localizacaoAtual, setLocalizacaoAtual] = useState(null);

  const filtrosParaTipos = useMemo(() => ({
    Bares: "bar",
    Restaurantes: "restaurant",
    Baladas: "night_club",
    Cafés: "cafe",
    Lanchonetes: "meal_takeaway",
    Adegas: "liquor_store",
    "Food Trucks": "meal_takeaway",
  }), []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  useEffect(() => {
    if (params.filtros) {
      try {
        const filtrosArray = JSON.parse(params.filtros);
        setFiltrosAtivos(filtrosArray);
      } catch {}
    }
  }, [params.filtros]);

  useEffect(() => {
    obterLocalizacao();
  }, []);

  useEffect(() => {
    if (localizacaoAtual) {
      buscarLugaresProximos();
    }
  }, [localizacaoAtual, filtrosAtivos]);

  const obterLocalizacao = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCarregando(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocalizacaoAtual({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setCarregando(false);
    } catch (e) {
      console.error("Erro ao obter localização (web):", e);
      setCarregando(false);
    }
  };

  const buscarPorTipo = async (lat, lng, tipo) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${tipo}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.status === "OK" ? data.results : [];
    } catch (error) {
      console.error("Erro ao buscar por tipo (web):", error);
      return [];
    }
  };

  const buscarLugaresProximos = async () => {
    if (!localizacaoAtual) return;
    setBuscando(true);
    try {
      let resultados = [];
      if (filtrosAtivos.length > 0) {
        const promises = filtrosAtivos.map((f) => {
          const tipo = filtrosParaTipos[f] || "restaurant";
          return buscarPorTipo(localizacaoAtual.latitude, localizacaoAtual.longitude, tipo);
        });
        const todosResultados = await Promise.all(promises);
        resultados = todosResultados.flat();
        resultados = resultados.filter((lugar, index, self) => index === self.findIndex((l) => l.place_id === lugar.place_id));
      } else {
        resultados = await buscarEstabelecimentosNoturnos(localizacaoAtual.latitude, localizacaoAtual.longitude, 5000);
      }
      setLugares(resultados);
    } catch (error) {
      console.error("Erro ao buscar lugares (web):", error);
    }
    setBuscando(false);
  };

  const realizarBusca = async () => {
    if (!buscaTexto.trim() || !localizacaoAtual) return;
    setBuscando(true);
    try {
      const resultados = await buscarPorTexto(
        buscaTexto,
        localizacaoAtual.latitude,
        localizacaoAtual.longitude,
        10000
      );
      setLugares(resultados);
    } catch (error) {
      console.error("Erro ao buscar (web):", error);
    }
    setBuscando(false);
  };

  const abrirDetalhes = (lugar) => {
    router.push({
      pathname: "/localDetails",
      params: {
        placeId: lugar.place_id,
        name: lugar.name,
        address: lugar.vicinity,
        rating: lugar.rating || 0,
        totalRatings: lugar.user_ratings_total || 0,
        types: JSON.stringify(lugar.types || []),
        latitude: lugar.geometry.location.lat,
        longitude: lugar.geometry.location.lng,
        isOpen: lugar.opening_hours?.open_now ? "true" : "false",
      },
    });
  };

  const center = useMemo(() => {
    if (!localizacaoAtual) return { lat: -23.55052, lng: -46.633308 };
    return { lat: localizacaoAtual.latitude, lng: localizacaoAtual.longitude };
  }, [localizacaoAtual]);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const centralizarNoUsuario = () => {
    if (mapRef.current && localizacaoAtual) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(14);
    }
  };

  if (carregando || !isLoaded) {
    return (
      <View style={[styles.fill, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>{loadError ? "Falha ao carregar o mapa" : "Carregando mapa..."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <GoogleMap
          onLoad={onMapLoad}
          mapContainerStyle={styles.mapStyle}
          center={center}
          zoom={14}
          options={{ streetViewControl: false, fullscreenControl: false }}
        >
          {lugares.map((lugar) => (
            <MarkerF
              key={lugar.place_id}
              position={{
                lat: lugar.geometry.location.lat,
                lng: lugar.geometry.location.lng,
              }}
              title={lugar.name}
              onClick={() => abrirDetalhes(lugar)}
            />
          ))}
        </GoogleMap>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Buscar bar, restaurante, balada..."
          placeholderTextColor="#666"
          style={styles.searchInput}
          value={buscaTexto}
          onChangeText={setBuscaTexto}
          onSubmitEditing={realizarBusca}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={realizarBusca} disabled={buscando}>
          {buscando ? (
            <ActivityIndicator size="small" color="#6C47FF" />
          ) : (
            <Ionicons name="search" size={20} color="#6C47FF" />
          )}
        </TouchableOpacity>
      </View>

      {lugares.length > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {lugares.length} {lugares.length === 1 ? "lugar encontrado" : "lugares encontrados"}
          </Text>
        </View>
      )}

      <View style={styles.botoesContainer}>
        <TouchableOpacity style={[styles.botao, styles.listaButton]} onPress={() => setMostrarLista(true)}>
          <Ionicons name="list" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, styles.locationButton]} onPress={centralizarNoUsuario}>
          <Ionicons name="navigate" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, styles.filtrosButton]} onPress={() => router.push("/filtros")}>
          <Ionicons name="filter" size={20} color="#fff" />
          {filtrosAtivos.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filtrosAtivos.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botao, styles.refreshButton]} onPress={buscarLugaresProximos} disabled={buscando}>
          {buscando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={mostrarLista} animationType="slide" onRequestClose={() => setMostrarLista(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lugares Próximos</Text>
            <TouchableOpacity onPress={() => setMostrarLista(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {lugares.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#999" />
                <Text style={styles.emptyText}>Nenhum lugar encontrado</Text>
              </View>
            ) : (
              lugares.map((lugar) => (
                <TouchableOpacity
                  key={lugar.place_id}
                  style={styles.lugarCard}
                  onPress={() => {
                    setMostrarLista(false);
                    abrirDetalhes(lugar);
                  }}
                >
                  <View style={styles.lugarHeader}>
                    <Ionicons name="location" size={24} color="#FF6B6B" />
                    <View style={styles.lugarInfo}>
                      <Text style={styles.lugarNome} numberOfLines={1}>
                        {lugar.name}
                      </Text>
                      <Text style={styles.lugarEndereco} numberOfLines={2}>
                        {lugar.vicinity}
                      </Text>
                    </View>
                  </View>

                  {lugar.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFB800" />
                      <Text style={styles.ratingText}>{lugar.rating}</Text>
                      {lugar.user_ratings_total && (
                        <Text style={styles.ratingCount}>({lugar.user_ratings_total})</Text>
                      )}
                    </View>
                  )}

                  {lugar.opening_hours && (
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: lugar.opening_hours.open_now ? "#4CAF50" : "#F44336" },
                        ]}
                      />
                      <Text style={styles.statusText}>
                        {lugar.opening_hours.open_now ? "Aberto agora" : "Fechado"}
                      </Text>
                    </View>
                  )}

                  <View style={styles.verDetalhes}>
                    <Text style={styles.verDetalhesText}>Ver detalhes</Text>
                    <Ionicons name="chevron-forward" size={20} color="#6C47FF" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fill: { flex: 1 },
  mapContainer: { flex: 1 },
  mapStyle: { width: "100%", height: "100%" },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#fff" },
  searchBox: {
    position: "absolute",
    top: 40,
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "white",
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchButton: {
    position: "absolute",
    right: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    position: "absolute",
    top: 105,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  infoText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  botoesContainer: {
    position: "absolute",
    bottom: 40,
    right: 20,
    flexDirection: "column",
    gap: 12,
  },
  botao: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listaButton: { backgroundColor: "#9C27B0" },
  locationButton: { backgroundColor: "#6C47FF" },
  filtrosButton: { backgroundColor: "#4A90E2" },
  refreshButton: { backgroundColor: "#50E3C2" },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  modalContainer: { flex: 1, backgroundColor: "#0a0a0a" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#1a1a1a",
  },
  modalTitle: { fontSize: 24, fontWeight: "700", color: "#fff" },
  modalContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyText: { marginTop: 16, fontSize: 18, color: "#999", fontWeight: "600" },
  lugarCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  lugarHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  lugarInfo: { flex: 1, marginLeft: 12 },
  lugarNome: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  lugarEndereco: { fontSize: 14, color: "#999", lineHeight: 20 },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ratingText: { marginLeft: 4, fontSize: 16, fontWeight: "600", color: "#FFB800" },
  ratingCount: { marginLeft: 4, fontSize: 14, color: "#666" },
  statusContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 14, color: "#999" },
  verDetalhes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  verDetalhesText: { fontSize: 14, color: "#6C47FF", fontWeight: "600", marginRight: 4 },
});
