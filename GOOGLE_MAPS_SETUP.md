# Configuração da API do Google Maps

## Passo 1: Obter a Chave da API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Places API**
   - **Geocoding API**

4. Vá em **Credenciais** → **Criar Credenciais** → **Chave de API**
5. Copie a chave gerada

## Passo 2: Configurar as Chaves no Projeto

### Configuração Unificada (Recomendado):

Edite o arquivo `.env` na raiz do projeto com sua chave:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

**Importante**: O projeto usa `app.config.js` ao invés de `app.json`, que automaticamente carrega a chave do `.env` para todas as plataformas (Web, Android e iOS). Você precisa configurar apenas uma vez no `.env`!

### Como funciona:

O arquivo `app.config.js` usa `process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` para configurar:
- **Web**: Requisições HTTP para Places API
- **Android**: `android.config.googleMaps.apiKey`
- **iOS**: `ios.config.googleMapsApiKey`

Todas as plataformas usam a mesma chave do `.env` automaticamente.

## Passo 3: Restringir a Chave (Recomendado)

No Google Cloud Console, configure restrições para sua chave:

### Para a chave web (Places API):
- **Restrições de aplicativo**: Referenciadores HTTP
- **Restrições de API**: Places API, Geocoding API

### Para a chave Android:
- **Restrições de aplicativo**: Apps Android
- **Nome do pacote**: `com.anonymous.app_locais_noturnos`
- **SHA-1**: [obtenha executando `keytool` no seu keystore]

### Para a chave iOS:
- **Restrições de aplicativo**: Apps iOS
- **IDs do pacote**: `com.anonymous.app-locais-noturnos`

## Funcionalidades Implementadas

✅ **Localização em tempo real**: O app solicita permissão e mostra a posição atual do usuário no mapa

✅ **Busca automática**: Ao abrir o mapa, busca automaticamente por:
- Bares
- Restaurantes
- Baladas (night_club)
- Cafés
- Lanchonetes (meal_takeaway)

✅ **Busca por texto**: Barra de pesquisa para encontrar lugares específicos

✅ **Marcadores interativos**: Cada lugar encontrado aparece como marcador no mapa

✅ **Navegação para detalhes**: Clique em um marcador para ver detalhes do lugar

✅ **Botões de controle**:
- 🧭 Centralizar no usuário
- 🔍 Filtros
- 🔄 Atualizar busca

## Estrutura dos Arquivos

```
app_locais_noturnos/
├── .env                          # Chave da API (NÃO COMMITAR)
├── app.config.js                 # Configuração dinâmica do Expo (usa .env)
├── app.json                      # Configuração estática (mantido para referência)
├── services/
│   └── googlePlaces.js          # Serviço de integração com Google Places API
└── app/
    └── map.js                   # Tela do mapa com todas as funcionalidades
```

## Testando

```bash
# Web
npm run web

# Android (com dispositivo/emulador conectado)
npm run android

# iOS (somente em macOS)
npm run ios
```

## Problemas Comuns

### "API key not valid"
- Verifique se as APIs estão ativadas no Google Cloud Console
- Certifique-se de que a chave está no formato correto no `.env`
- Para Android/iOS, verifique se as chaves estão corretas no `app.json`

### Localização não funciona
- Verifique se deu permissão de localização ao app
- No iOS, verifique as permissões em Ajustes → Privacidade → Localização
- No Android, verifique em Configurações → Apps → Permissões

### Marcadores não aparecem
- Verifique se a busca está retornando resultados (veja o console)
- Tente aumentar o raio de busca em `services/googlePlaces.js`
- Certifique-se de que a Places API está ativada

## Segurança

⚠️ **IMPORTANTE**: O arquivo `.env` contém sua chave da API e NÃO deve ser commitado no Git.

O `.gitignore` já está configurado para ignorar o arquivo `.env`. Nunca compartilhe suas chaves publicamente.
