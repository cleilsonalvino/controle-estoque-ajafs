import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {api} from "@/lib/api";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  papel: string;
  telasPermitidas: string[];
  ativo: boolean;
  criadoEm: string;
  empresa: {
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
  };
}

interface User {
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ======================================================
  // 🔹 Busca o perfil do usuário logado
  // ======================================================
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<{ user: AuthUser }>("/auth/me");
      if (data && data.user?.id && data.user?.empresa?.id) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.warn("Resposta incompleta da API /auth/me", data);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Falha ao buscar perfil do usuário:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ======================================================
  // 🔹 Verifica token no carregamento inicial
  // ======================================================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Evita chamadas múltiplas
    if (!user && !isAuthenticated) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, fetchUserProfile]);

  // ======================================================
  // 🔹 Login
  // ======================================================
  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, senha });

      if (!data.token) throw new Error("Token não retornado pela API.");

      
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      await fetchUserProfile();
      return {
        success: true,
        user: data.user.papel,
      };
    } catch (error) {
      console.error("Erro no login:", error);
      logout(); // logout já agrupa os states
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
    // Não definimos isLoading aqui para evitar piscar a tela se o logout for rápido
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
