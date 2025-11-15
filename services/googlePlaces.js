// Serviço para integração com Google Places API
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
export const DEFAULT_RADIUS_METERS = 2000;
export const kmToMeters = (km) => Math.max(0, Math.round(km * 1000));

/**
 * Busca lugares próximos com base na localização atual
 * @param {number} latitude - Latitude da localização atual
 * @param {number} longitude - Longitude da localização atual
 * @param {string} type - Tipo de lugar (bar, restaurant, night_club, etc)
 * @param {number} radius - Raio de busca em metros (padrão: 5000m = 5km)
 * @returns {Promise<Array>} Lista de lugares encontrados
 */
export const buscarLugaresProximos = async (
  latitude,
  longitude,
  type = 'restaurant',
  radius = DEFAULT_RADIUS_METERS
) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results;
    } else {
      console.error('Erro ao buscar lugares:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return [];
  }
};

/**
 * Busca múltiplos tipos de estabelecimentos de uma vez
 * @param {number} latitude - Latitude da localização atual
 * @param {number} longitude - Longitude da localização atual
 * @param {Array<string>} types - Array com tipos de lugares
 * @param {number} radius - Raio de busca em metros
 * @returns {Promise<Array>} Lista combinada de todos os lugares encontrados
 */
export const buscarEstabelecimentosNoturnos = async (
  latitude,
  longitude,
  radius = DEFAULT_RADIUS_METERS
) => {
  const tipos = ['bar', 'restaurant', 'night_club', 'cafe', 'meal_takeaway', 'liquor_store'];
  
  try {
    // Busca todos os tipos em paralelo
    const promises = tipos.map(tipo => 
      buscarLugaresProximos(latitude, longitude, tipo, radius)
    );
    
    const resultados = await Promise.all(promises);
    
    // Combina todos os resultados e remove duplicatas
    const todosLugares = resultados.flat();
    const lugaresUnicos = todosLugares.filter((lugar, index, self) =>
      index === self.findIndex((l) => l.place_id === lugar.place_id)
    );
    
    return lugaresUnicos;
  } catch (error) {
    console.error('Erro ao buscar estabelecimentos:', error);
    return [];
  }
};

/**
 * Busca detalhes de um lugar específico
 * @param {string} placeId - ID do lugar no Google Places
 * @returns {Promise<Object>} Detalhes do lugar
 */
export const buscarDetalhesLugar = async (placeId) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      console.error('Erro ao buscar detalhes:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return null;
  }
};

/**
 * Busca lugares com base em uma query de texto
 * @param {string} query - Texto da busca
 * @param {number} latitude - Latitude da localização atual
 * @param {number} longitude - Longitude da localização atual
 * @param {number} radius - Raio de busca em metros
 * @returns {Promise<Array>} Lista de lugares encontrados
 */
export const buscarPorTexto = async (
  query,
  latitude,
  longitude,
  radius = DEFAULT_RADIUS_METERS
) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results;
    } else {
      console.error('Erro ao buscar por texto:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return [];
  }
};
