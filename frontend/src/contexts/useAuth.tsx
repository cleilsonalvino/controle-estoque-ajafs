import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api"; // Corrigido: usando caminho relativo

// Defina uma interface para o seu objeto de usuário
interface User {
  id: string;
  nome: string;
  email: string;
  papel: string;
  telasPermitidas: string[]; // O mais importante!
  criadoEm: string;
  ativo: boolean;
}

const AuthContext = createContext({
  user: null as User | null,
  isAuthenticated: false,
  isLoading: true, // NOVO ESTADO: Começa como true
  login: async (_email: string, _password: string) => false,
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // NOVO ESTADO

  // Função para buscar dados do perfil do usuário
  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Falha ao buscar perfil do usuário, fazendo logout.", error);
      logout();
    } finally {
      setIsLoading(false); // NOVO: Termina o carregamento
    }
  }, []);

  // Carregar usuário ao abrir o app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setIsLoading(false); // NOVO: Se não há token, não está carregando
    }
  }, [fetchUserProfile]);

  const login = async (email: any, senha: any) => {
    setIsLoading(true); // NOVO: Inicia o carregamento ao tentar logar
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      const token = data.token;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      await fetchUserProfile(); // Busca os dados (que vai setar isLoading=false no final)
      
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      setIsLoading(false); // NOVO: Para de carregar se o login falhar
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false); // NOVO: Garante que não está carregando
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

