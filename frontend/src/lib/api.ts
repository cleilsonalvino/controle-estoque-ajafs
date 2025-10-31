import axios from "axios";

// ==============================================
// 🔧 Configuração principal
// ==============================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ==============================================
// 🚀 Interceptador de requisição
// ==============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Erro antes do envio da requisição:", error);
    return Promise.reject(error);
  }
);

// ==============================================
// ⚠️ Interceptador de resposta
// ==============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 Se o token for inválido ou expirado
    if (status === 401) {
      console.warn("Sessão expirada. Redirecionando para login...");
      localStorage.removeItem("token");
      window.location.href = "/login"; // ajuste conforme sua rota
    }

    // 🚫 Erros de permissão
    if (status === 403) {
      console.warn("Acesso negado: você não tem permissão para essa ação.");
    }

    // ⚙️ Erros de servidor
    if (status >= 500) {
      console.error("Erro interno do servidor:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
