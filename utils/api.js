import axios from 'axios';


// Variáveis de ambiente
const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRECT;
console.log("ClientID lido:", CLIENT_ID);
console.log("CLIENT_SECRET lido:", CLIENT_SECRET);
const TOKEN_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
const apiSearchFlightUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers?'

// Variável para armazenar o token e sua expiração
let accessToken = null;
let tokenExpiresAt = 0;

// 1. Função para obter/renovar o token
export const getAccessToken = async () => {
    // Se o token existe e ainda é válido por mais de 60 segundos, retorne-o
    if (accessToken && Date.now() < tokenExpiresAt - 60000) {
        return accessToken;
    }

    try {
        // CORREÇÃO: Usar URLSearchParams para 'application/x-www-form-urlencoded'
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('grant_type', 'client_credentials');

        const response = await axios.post(TOKEN_URL, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });

        const data = response.data;
        accessToken = data.access_token;
        // Calcula o tempo de expiração: tempo atual + expiração em milissegundos
        tokenExpiresAt = Date.now() + (data.expires_in * 1000); 

        console.log("Token Amadeus obtido com sucesso.");
        return accessToken;

    } catch (error) {
        console.error("Erro ao obter o token Amadeus:", error.response ? error.response.data : error.message);
        throw new Error("Falha ao obter o token de acesso Amadeus.");
    }
};

// 2. Cria a instância do Axios para as requisições da API (não para o token)
export const amadeusApi = axios.create({
    baseURL: API_BASE_URL + '/',
});

// 3. Adiciona um interceptor para injetar o token em CADA requisição
amadeusApi.interceptors.request.use(async config => {
    const token = await getAccessToken();
    // Injeta o token obtido no header Authorization
    config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => {
    return Promise.reject(error);
});