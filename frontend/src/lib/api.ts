import axios from "axios";

// Cria a instância do Axios
const api = axios.create({
  baseURL: "http://localhost:3000/api", // URL base da API
  timeout: 10000, // tempo máximo de espera em ms
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Interceptador de requisições (opcional)
api.interceptors.request.use(
  (config) => {
    // Por exemplo, adiciona token de autenticação
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de respostas (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros globalmente
    console.error("Erro na requisição:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
