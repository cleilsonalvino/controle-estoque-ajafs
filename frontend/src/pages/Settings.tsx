import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Building,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import api from "@/lib/api";
import { allMenuItems } from "@/config/menuItems";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputMask from "react-input-mask";
import axios from "axios";
import { set } from "date-fns";

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
});

const userSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string(),
    telasPermitidas: z.array(z.string()).default([]),
    papel: z.enum(["ADMINISTRADOR", "USUARIO"]),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

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

const Settings = () => {
  const { empresa, loading, createEmpresa, updateEmpresa } = useEmpresa();
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const userLogado = JSON.parse(localStorage.getItem("user"));


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

  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    control: controlUser,
    formState: { errors: userErrors, isSubmitting: isUserSubmitting },
    reset: resetUserForm,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { telasPermitidas: [] },
  });

  // ✅ Carregar empresa no formulário assim que for obtida do contexto
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
    if (empresa?.id) {
      await updateEmpresa(data, empresa.id);
    } else {
      await createEmpresa(data as Omit<Empresa, "id">);
    }
  };

  // ✅ Criar novo usuário
  const onCreateUser = async (data: UserFormData) => {
    try {
      const { confirmarSenha, ...payload } = data;
      await api.post("/usuarios", payload);
      sonnerToast.success("Usuário criado com sucesso!");
      resetUserForm();
    } catch {
      sonnerToast.error("Erro ao criar usuário. Tente novamente.");
    }
  };

  const getUsers = async () => {
    try {
      const { data } = await api.get("/usuarios");
      setUsers(data);
    } catch {
      sonnerToast.error("Erro ao buscar usuários. Tente novamente.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/usuarios/${userId}`);
      sonnerToast.success("Usuário excluído com sucesso!");
      getUsers();
    } catch {
      sonnerToast.error("Erro ao excluir usuário. Tente novamente.");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  if (loading) return <p className="p-8">Carregando configurações...</p>;

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
                        {...field} // ✅ Isso já inclui value, onChange e onBlur
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5" />
              Usuários
            </CardTitle>
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
                          {user.papel === "admin" ? "Administrador" : "Usuário"}
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex gap-2">
                            {user.id === userLogado.id ? (
                              <Button variant="secondary" disabled>
                                Você
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  confirm(
                                    "Deseja realmente excluir este usuário?"
                                  ) && handleDeleteUser(user.id);
                                }}
                              >
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

        {/* ==================== */}
        {/* Card: Usuários */}
        {/* ==================== */}
        <form onSubmit={handleSubmitUser(onCreateUser)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5" />
                Cadastrar Novo Usuário
              </CardTitle>
              <CardDescription>
                Crie contas de acesso para seus colaboradores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="senha">Senha*</Label>
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
                  <Label htmlFor="confirmarSenha">Confirmar Senha*</Label>
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
                <Label htmlFor="confirmarSenha">Tipo*</Label>
                <Controller
                  name="papel"
                  control={controlUser}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Controller
                  name="telasPermitidas"
                  control={controlUser}
                  render={({ field }) => (
                    <>
                      {allMenuItems
                        .filter((item) => item.url !== "/") // Não permite dar permissão para a Home
                        .map((item) => (
                          <div
                            key={item.key} // A key interna ainda é útil para o React
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={item.url} // ID deve ser único
                              checked={field.value?.includes(item.url)} // Compara com a URL
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.url]) // Adiciona a URL
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.url // Remove a URL
                                      )
                                    );
                              }}
                            />
                            <Label
                              htmlFor={item.url} // Associa com o ID
                              className="cursor-pointer"
                            >
                              {item.title}
                            </Label>
                          </div>
                        ))}
                    </>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isUserSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isUserSubmitting ? "Salvando..." : "Criar Usuário"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Settings;
