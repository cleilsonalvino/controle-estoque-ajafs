import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/api";

interface User {
  user: {
    id: string;
    nome: string;
    email: string;
    papel: string;
    telasPermitidas: string[];
    ativo: boolean;
    criadoEm: string;
    empresa:{
      id: string;
      nome: string;
      nomeFantasia: string;
      razaoSocial: string;
      cnpj: string;
      telefone: string;
      logoEmpresa: string;
      endereco: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      inscEstadual: string;
      inscMunicipal: string;
      cnae: string;
    }
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ======================================================
  // 🔹 Busca o perfil do usuário logado
  // ======================================================
  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");

      if (data && data.user?.id && data.user?.empresa?.id) {
        setUser(data);
        setIsAuthenticated(true);
      } else {
        console.warn("Resposta incompleta da API /auth/me", data);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Falha ao buscar perfil do usuário:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ======================================================
  // 🔹 Verifica token no carregamento inicial
  // ======================================================
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchUserProfile();
  } else {
    // Evita chamadas desnecessárias sem token
    setIsAuthenticated(false);
    setIsLoading(false);
  }
}, [fetchUserProfile]);


  // ======================================================
  // 🔹 Login
  // ======================================================
  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, senha });

      if (!data.token) throw new Error("Token não retornado pela API.");

      // Armazena token e configura Axios
      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      // Busca o perfil do usuário
      await fetchUserProfile();

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // 🔹 Logout
  // ======================================================
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  // ======================================================
  // 🔹 Retorno do contexto
  // ======================================================
  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
