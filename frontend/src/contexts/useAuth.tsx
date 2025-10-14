import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api"; // ajuste o caminho conforme seu projeto

const AuthContext = createContext({
  user: null,
  isAuthenticated: false as boolean,
  login: async (_email: string, _password: string) => false as boolean,
  logout: () => {},
});

// Provider principal
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carregar usuário ao abrir o app (se tiver token salvo)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  }, []);

  // Função para buscar dados do usuário autenticado

  // Função de login
  const login = async (email: any, senha: any) => {
    try {
      const { data } = await api.post("/auth/login", { email, senha });

      const token = data.token; // ajuste conforme sua resposta da API
      console.log("Token recebido:", token);

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => useContext(AuthContext);
