import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type PapelUsuario = "ADMINISTRADOR" | "USUARIO";

export interface UsuarioAPI {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  telasPermitidas: string[];
  urlImagem?: string;
  // Se o backend mandar campos extras, o TS nao reclama
  [chave: string]: any;
}

interface UsersContextType {
  usuarios: UsuarioAPI[];
  carregandoUsuarios: boolean;
  erroUsuarios: string | null;
  listarUsuarios: () => Promise<void>;
  buscarUsuarioPorId: (id: string) => Promise<UsuarioAPI | null>;
  criarUsuario: (dados: FormData) => Promise<void>;
  atualizarUsuario: (id: string, dados: FormData) => Promise<void>;
  excluirUsuario: (id: string) => Promise<void>;
}

const UsersContext = createContext<UsersContextType>({} as UsersContextType);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [erroUsuarios, setErroUsuarios] = useState<string | null>(null);

  // Busca lista de usuarios
  const listarUsuarios = useCallback(async () => {
    setCarregandoUsuarios(true);
    setErroUsuarios(null);
    try {
      const { data } = await api.get<UsuarioAPI[]>("/usuarios");
      setUsuarios(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuarios", error);
      setErroUsuarios("Erro ao buscar usuarios");
      toast.error("Erro ao buscar usuarios. Tente novamente.");
    } finally {
      setCarregandoUsuarios(false);
    }
  }, []);

  // Busca usuario detalhado
  const buscarUsuarioPorId = useCallback(
    async (id: string): Promise<UsuarioAPI | null> => {
      try {
        const { data } = await api.get<UsuarioAPI>(`/usuarios/${id}`);
        return data;
      } catch (error) {
        console.error("Erro ao buscar usuario por id", error);
        toast.error("Erro ao buscar usuario. Tente novamente.");
        return null;
      }
    },
    []
  );

  // Criar usuario
  const criarUsuario = useCallback(
    async (dados: FormData) => {
      try {
        await api.post("/usuarios", dados, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Usuario criado com sucesso");
        await listarUsuarios();
      } catch (error) {
        console.error("Erro ao criar usuario", error);
        toast.error("Erro ao criar usuario. Tente novamente.");
      }
    },
    [listarUsuarios]
  );

  // Atualizar usuario
  const atualizarUsuario = useCallback(
    async (id: string, dados: FormData) => {
      try {
        await api.put(`/usuarios/${id}`, dados, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Usuario atualizado com sucesso");
        await listarUsuarios();
      } catch (error) {
        console.error("Erro ao atualizar usuario", error);
        toast.error("Erro ao atualizar usuario. Tente novamente.");
      }
    },
    [listarUsuarios]
  );

  // Excluir usuario
  const excluirUsuario = useCallback(
    async (id: string) => {
      if (!window.confirm("Deseja realmente excluir este usuario")) return;

      try {
        await api.delete(`/usuarios/${id}`);
        toast.success("Usuario excluido com sucesso");
        await listarUsuarios();
      } catch (error) {
        console.error("Erro ao excluir usuario", error);
        toast.error("Erro ao excluir usuario. Tente novamente.");
      }
    },
    [listarUsuarios]
  );

  // Carrega lista ao montar
  useEffect(() => {
    listarUsuarios();
  }, [listarUsuarios]);

  return (
    <UsersContext.Provider
      value={{
        usuarios,
        carregandoUsuarios,
        erroUsuarios,
        listarUsuarios,
        buscarUsuarioPorId,
        criarUsuario,
        atualizarUsuario,
        excluirUsuario,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);
