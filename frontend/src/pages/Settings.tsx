import { useEffect, useState, useMemo } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Building,
  UserPlus,
  UserPen,
  Trash2,
  ListRestart,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog, // 👈 NOVO: Componentes do Modal
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEmpresa, Empresa } from "@/contexts/EmpresaContext";
import { toast as sonnerToast } from "sonner";
import { api } from "@/lib/api";
import { allMenuItems } from "@/config/menuItems";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputMask from "react-input-mask";
import axios from "axios";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// ==========================
// 🔹 Esquemas de Validação
// ==========================
const empresaSchema = z.object({
  cnpj: z.string().min(1, "CNPJ/CPF é obrigatório"),
  razaoSocial: z.string().min(1, "Razão Social é obrigatória"),
  nomeFantasia: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cep: z.string().optional(),
  estado: z.string().optional(),
  cidade: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  urlImage: z.any().optional(),
});

const userSchema = z
  .object({
    id: z.string().optional(),
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    senha: z.string().optional(),
    confirmarSenha: z.string().optional(),
    telasPermitidas: z.array(z.string()).default([]),
    papel: z.enum(["ADMINISTRADOR", "USUARIO"]),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })
  .refine(
    (data) => {
      if (data.senha && data.senha.length > 0) {
        return data.senha.length >= 6;
      }
      return true;
    },
    {
      message: "A senha deve ter no mínimo 6 caracteres",
      path: ["senha"],
    }
  );

type EmpresaFormData = z.infer<typeof empresaSchema>;
type UserFormData = z.infer<typeof userSchema>;

const estadosBrasileiros = [
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "TO", nome: "Tocantins" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
];

type UserAPI = {
  id: string;
  nome: string;
  email: string;
  papel: "ADMINISTRADOR" | "USUARIO";
  telasPermitidas: string[];
};

const Settings = () => {
  const { empresa, loading, createEmpresa, updateEmpresa } = useEmpresa();
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAPI | null>(null);
  const [users, setUsers] = useState<UserAPI[]>([]);

  // 👈 NOVO: Estado para controlar a abertura do modal de usuário
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const userLogado = JSON.parse(localStorage.getItem("user") || "{}");

  // --- Formulário da Empresa ---
  const {
    handleSubmit: handleSubmitEmpresa,
    control: controlEmpresa,
    setValue: setEmpresaValue,
    formState: {
      errors: empresaErrors,
      isDirty: isEmpresaDirty,
      isSubmitting: isEmpresaSubmitting,
    },
    reset: resetEmpresaForm,
    register: registerEmpresa,
  } = useForm<EmpresaFormData>({ resolver: zodResolver(empresaSchema) });

  // --- Formulário do Usuário ---
  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    control: controlUser,
    formState: {
      errors: userErrors,
      isSubmitting: isUserSubmitting,
      isDirty: isUserDirty,
    },
    reset: resetUserForm,
    setValue: setUserValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { telasPermitidas: [], papel: "USUARIO" },
  });

  // ✅ Lógica de Agrupamento para Permissões
  const groupedMenuPermissions = useMemo(() => {
    const grupos: Record<string, typeof allMenuItems> = {
      Gestão: [],
      Financeiro: [],
      Cadastros: [],
      Serviços: [],
      Outros: [],
    };

    const filteredItems = allMenuItems.filter((item) => item.url !== "/");

    filteredItems.forEach((item) => {
      if (item.key.startsWith("financeiro-")) {
        grupos["Financeiro"].push(item);
      } else if (
        ["estoque", "dashboard-sales", "sales", "pos-venda"].includes(item.key)
      ) {
        grupos["Gestão"].push(item);
      } else if (
        [
          "products",
          "movements",
          "suppliers",
          "categories",
          "clientes",
          "vendedores",
        ].includes(item.key)
      ) {
        grupos["Cadastros"].push(item);
      } else if (["tipos-servicos", "service-categories"].includes(item.key)) {
        grupos["Serviços"].push(item);
      } else if (["settings", "super_admin"].includes(item.key)) {
        grupos["Outros"].push(item);
      } else {
        grupos["Outros"].push(item);
      }
    });

    return Object.entries(grupos).filter(([, itens]) => itens.length > 0);
  }, []);

  // ✅ Carregar empresa no formulário
  useEffect(() => {
    if (empresa) {
      resetEmpresaForm(empresa);
    }
  }, [empresa, resetEmpresaForm]);

  // ✅ Busca automática de endereço via CEP
  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      if (!data.erro) {
        setEmpresaValue("endereco", data.logradouro);
        setEmpresaValue("bairro", data.bairro);
        setEmpresaValue("cidade", data.localidade);
        setEmpresaValue("estado", data.uf);
        sonnerToast.success("Endereço preenchido automaticamente!");
      } else {
        sonnerToast.error("CEP não encontrado.");
      }
    } catch {
      sonnerToast.error("Falha ao buscar CEP.");
    }
  };

  // ✅ Salvar empresa
  const onSaveEmpresa = async (data: EmpresaFormData) => {
    const file = data.urlImage?.[0];
    const dataToSend = { ...data, urlImage: file };

    if (empresa?.id) {
      await updateEmpresa(dataToSend, empresa.id);
    } else {
      // The createEmpresa function needs to be adapted to handle FormData
      // await createEmpresa(dataToSend as Omit<Empresa, "id">);
    }
  };

  // ===================================
  // 🚀 Lógica de Usuários (Ajustada para o Modal)
  // ===================================

  // ✅ Busca lista de usuários
  const getUsers = async () => {
    try {
      const { data } = await api.get("/usuarios");
      setUsers(data);
    } catch {
      sonnerToast.error("Erro ao buscar usuários. Tente novamente.");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // 👈 NOVO: Função para fechar o modal e limpar o estado de edição
  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    resetUserForm();
  };

  // 📝 Configura o formulário para EDIÇÃO e abre o modal
  const onEditUser = (user: UserAPI) => {
    setEditingUser(user);
    // Preenche o formulário com os dados do usuário
    resetUserForm({
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      telasPermitidas: user.telasPermitidas || [], // Garante que é um array
    });
    // ABRIR MODAL
    setIsUserModalOpen(true);
  };

  // 📝 Configura o formulário para CRIAÇÃO e abre o modal
  const onNewUser = () => {
    setEditingUser(null);
    resetUserForm();
    setIsUserModalOpen(true);
  };

  // ✅ Ação de criação/edição de usuário
  const handleUserSubmit = async (data: UserFormData) => {
    const { confirmarSenha, ...payload } = data;

    try {
      if (editingUser?.id) {
        // Remove senha se estiver vazia para não alterar
        if (!payload.senha) {
          delete payload.senha;
        }

        await api.put(`/usuarios/${editingUser.id}`, payload);
        sonnerToast.success("Usuário atualizado com sucesso!");
      } else {
        await api.post("/usuarios", payload);
        sonnerToast.success("Usuário criado com sucesso!");
      }

      // AÇÕES DE SUCESSO
      handleCloseUserModal(); // Fecha o modal e limpa o formulário
      getUsers(); // Atualiza a lista
    } catch {
      sonnerToast.error(
        `Erro ao ${
          editingUser ? "atualizar" : "criar"
        } usuário. Tente novamente.`
      );
    }
  };

  // ✅ Excluir usuário
  const handleDeleteUser = async (userId: string) => {
    if (confirm("Deseja realmente excluir este usuário?")) {
      try {
        await api.delete(`/usuarios/${userId}`);
        sonnerToast.success("Usuário excluído com sucesso!");
        getUsers();
        // Se o usuário excluído era o que estava sendo editado, fecha o modal
        if (editingUser?.id === userId) {
          handleCloseUserModal();
        }
      } catch {
        sonnerToast.error("Erro ao excluir usuário. Tente novamente.");
      }
    }
  };

  // ✅ Cancelar edição do usuário (apenas fecha o modal)
  const handleCancelUserEdit = () => {
    handleCloseUserModal();
  };

  if (loading) return <p className="p-8">Carregando configurações...</p>;

  // ===================================
  // 🖼️ Renderização do Componente
  // ===================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-primary rounded-lg text-primary-foreground">
          <SettingsIcon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize o sistema conforme suas necessidades
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* ==================== */}
        {/* Card: Empresa */}
        {/* ==================== */}
        <form onSubmit={handleSubmitEmpresa(onSaveEmpresa)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Dados cadastrais, fiscais e de contato.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar Edição" : "Editar Informações"}
                </Button>
              </div>

              {/* Campos principais */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ / CPF*</Label>
                  <Controller
                    name="cnpj"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <InputMask
                        {...field}
                        mask="99.999.999/9999-99"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={!isEditing}
                      >
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            id="cnpj"
                            placeholder="00.000.000/0001-00"
                            disabled={!isEditing}
                          />
                        )}
                      </InputMask>
                    )}
                  />
                  {empresaErrors.cnpj && (
                    <p className="text-red-500 text-sm mt-1">
                      {empresaErrors.cnpj.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="razaoSocial">Razão Social / Nome*</Label>
                  <Input
                    id="razaoSocial"
                    {...registerEmpresa("razaoSocial")}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlImage">Logo da Empresa</Label>
                <Input
                    id="urlImage"
                    type="file"
                    accept="image/*"
                    {...registerEmpresa("urlImage")}
                    disabled={!isEditing}
                />
              </div>
              
              {empresa?.urlImage && (
                <div className="mt-2 flex justify-center">
                    <img
                        src={empresa.urlImage}
                        alt="Logo da Empresa"
                        className="w-32 h-32 object-contain border rounded-md shadow-sm bg-white"
                    />
                </div>
              )}


              {/* Contato e endereço */}
              <Separator />
              <h3 className="text-md font-semibold">Contato e Endereço</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Controller
                    name="telefone"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <InputMask
                        {...field}
                        mask="(99) 99999-9999"
                        disabled={!isEditing}
                      >
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            id="telefone"
                            placeholder="(79) 99999-9999"
                            disabled={!isEditing}
                          />
                        )}
                      </InputMask>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerEmpresa("email")}
                    disabled={!isEditing}
                  />
                  {empresaErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {empresaErrors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Controller
                    name="cep"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <InputMask
                        {...field}
                        mask="99999-999"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={(e) => {
                          field.onBlur();
                          if (isEditing) handleCepBlur(e.target.value);
                        }}
                        disabled={!isEditing}
                      >
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            id="cep"
                            placeholder="00000-000"
                            disabled={!isEditing}
                          />
                        )}
                      </InputMask>
                    )}
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <Controller
                    name="estado"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {estadosBrasileiros.map((uf) => (
                            <SelectItem key={uf.sigla} value={uf.sigla}>
                              {uf.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label>Cidade</Label>
                  <Input
                    id="cidade"
                    {...registerEmpresa("cidade")}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    {...registerEmpresa("endereco")}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    {...registerEmpresa("numero")}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    {...registerEmpresa("bairro")}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              {isEditing && (
                <Button
                  type="submit"
                  disabled={!isEmpresaDirty || isEmpresaSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEmpresaSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>

        <Separator />

        {/* ==================== */}
        {/* Card: Lista de Usuários (com botão para abrir modal de criação) */}
        {/* ==================== */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5" />
                Lista de Usuários Cadastrados
              </CardTitle>
              <CardDescription>
                Visualize, edite e gerencie as contas de acesso.
              </CardDescription>
            </div>
            {/* 👈 BOTÃO PARA ABRIR O MODAL DE CRIAÇÃO */}
            <Button onClick={onNewUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left border">Nome</th>
                    <th className="px-4 py-2 text-left border">Email</th>
                    <th className="px-4 py-2 text-left border">Papel</th>
                    <th className="px-4 py-2 text-left border">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{user.nome}</td>
                        <td className="px-4 py-2 border">{user.email}</td>
                        <td className="px-4 py-2 border capitalize">
                          {user.papel === "ADMINISTRADOR"
                            ? "Administrador"
                            : "Usuário"}
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex gap-2">
                            {/* Botão de Edição (chama onEditUser para abrir o modal) */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditUser(user)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>

                            {/* Botão de Exclusão */}
                            {user.id === userLogado.id ? (
                              <Button variant="secondary" size="sm" disabled>
                                Você
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-gray-500 border"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* REMOVIDO: O formulário que estava embutido aqui foi movido para o Dialog abaixo */}
      </div>

      {/* ======================================= */}
      {/* 🚀 NOVO: Dialog (Modal) para Edição/Criação */}
      {/* ======================================= */}
      <Dialog open={isUserModalOpen} onOpenChange={handleCloseUserModal}>
        <DialogContent className="sm:max-w-[800px] h-screen overflow-y-auto scroll-smooth">
          <form onSubmit={handleSubmitUser(handleUserSubmit)}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                {editingUser ? (
                  <>
                    <UserPen className="h-6 w-6" />
                    Editar Usuário: **{editingUser.nome}**
                  </>
                ) : (
                  <>
                    <UserPlus className="h-6 w-6" />
                    Cadastrar Novo Usuário
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Altere os dados, permissões e, opcionalmente, a senha do usuário."
                  : "Crie contas de acesso para seus colaboradores."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do usuário*</Label>
                  <Input id="nome" {...registerUser("nome")} />
                  {userErrors.nome && (
                    <p className="text-red-500 text-sm mt-1">
                      {userErrors.nome.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="emailUser">Email*</Label>
                  <Input
                    id="emailUser"
                    type="email"
                    {...registerUser("email")}
                    disabled={editingUser?.id === userLogado.id}
                  />
                  {userErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {userErrors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senha">
                    Senha
                    {editingUser ? " (Deixe em branco para não alterar)" : "*"}
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    {...registerUser("senha")}
                  />
                  {userErrors.senha && (
                    <p className="text-red-500 text-sm mt-1">
                      {userErrors.senha.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmarSenha">
                    Confirmar Senha{editingUser ? "" : "*"}
                  </Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    {...registerUser("confirmarSenha")}
                  />
                  {userErrors.confirmarSenha && (
                    <p className="text-red-500 text-sm mt-1">
                      {userErrors.confirmarSenha.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="papel">Tipo*</Label>
                <Controller
                  name="papel"
                  control={controlUser}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      // Impede a alteração do próprio papel para evitar bloqueio
                      disabled={editingUser?.id === userLogado.id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMINISTRADOR">
                          Administrador
                        </SelectItem>
                        <SelectItem value="USUARIO">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {userErrors.papel && (
                  <p className="text-red-500 text-sm mt-1">
                    {userErrors.papel.message}
                  </p>
                )}
              </div>

              <Separator />
              <h4 className="font-semibold">Permissões de Acesso</h4>

              <div className="space-y-6">
                <Controller
                  name="telasPermitidas"
                  control={controlUser}
                  render={({ field }) => (
                    <TooltipProvider>
                      {groupedMenuPermissions.map(([categoria, itens]) => (
                        <div key={categoria}>
                          <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 border-b pb-1">
                            {categoria}
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {itens.map((item) => (
                              <Tooltip key={item.url}>
                                <div className="flex items-center space-x-2">
                                  {/* Checkbox */}
                                  <Checkbox
                                    id={`check-${item.url}`}
                                    checked={field.value?.includes(item.url)}
                                    // Desabilita alteração para o próprio ADMIN logado
                                    disabled={
                                      editingUser?.id === userLogado.id &&
                                      editingUser?.papel === "ADMINISTRADOR"
                                    }
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            item.url,
                                          ]) // Adiciona a URL
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.url // Remove a URL
                                            )
                                          );
                                    }}
                                  />

                                  {/* TooltipTrigger: Envolve o Label */}
                                  <TooltipTrigger asChild>
                                    <Label
                                      htmlFor={`check-${item.url}`}
                                      className="cursor-pointer font-normal text-sm"
                                    >
                                      {item.title}
                                    </Label>
                                  </TooltipTrigger>

                                  {/* TooltipContent: Exibe a descrição */}
                                  <TooltipContent className="mt-2 absolute w-40" >
                                    <p className="max-w-xs text-sm ">
                                      {item.description ||
                                        `Permissão para acessar a tela de ${item.title}.`}
                                    </p>
                                  </TooltipContent>
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      ))}
                    </TooltipProvider>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              {editingUser && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelUserEdit}
                >
                  <ListRestart className="h-4 w-4 mr-2" />
                  Cancelar Edição
                </Button>
              )}
              <Button
                type="submit"
                disabled={isUserSubmitting || (editingUser && !isUserDirty)}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUserSubmitting
                  ? "Salvando..."
                  : editingUser
                  ? "Salvar Alterações"
                  : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
