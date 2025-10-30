import { useEffect } from "react";
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
import { availableScreens } from "@/config/menuItems";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputMask from "react-input-mask";
import axios from "axios";

// Esquema de validação para a empresa
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

// Esquema de validação para o novo usuário
const userSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string(),
    telasPermitidas: z.array(z.string()).default([]),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type EmpresaFormData = z.infer<typeof empresaSchema>;
type UserFormData = z.infer<typeof userSchema>;

const estadosBrasileiros = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

const Settings = () => {
  const { empresa, loading, createEmpresa, updateEmpresa, fetchEmpresa } =
    useEmpresa();

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

  // --- CORREÇÃO APLICADA AQUI ---
  useEffect(() => {
    fetchEmpresa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // O array DEVE estar vazio para executar apenas no "mount"

  useEffect(() => {
    if (empresa) {
      resetEmpresaForm(empresa);
    }
  }, [empresa, resetEmpresaForm]);

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      if (!data.erro) {
        setEmpresaValue("endereco", data.logradouro, { shouldDirty: true });
        setEmpresaValue("bairro", data.bairro, { shouldDirty: true });
        setEmpresaValue("cidade", data.localidade, { shouldDirty: true });
        setEmpresaValue("estado", data.uf, { shouldDirty: true });
        sonnerToast.success("Endereço preenchido automaticamente!");
      } else {
        sonnerToast.error("CEP não encontrado.");
      }
    } catch {
      sonnerToast.error("Falha ao buscar CEP.");
    }
  };

  const onSaveEmpresa = async (data: EmpresaFormData) => {
    if (empresa) {
      await updateEmpresa(data);
    } else {
      await createEmpresa(data as Omit<Empresa, "id">);
    }
  };

  const onCreateUser = async (data: UserFormData) => {
    try {
      const { confirmarSenha, ...payload } = data;
      await api.post("/usuarios", payload);
      sonnerToast.success("Usuário criado com sucesso!");
      resetUserForm();
    } catch (error) {
      sonnerToast.error("Erro ao criar usuário. Tente novamente.");
    }
  };

  if (loading) return <p className="p-8">Carregando configurações...</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
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
        {/* Card de Informações da Empresa */}
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ / CPF*</Label>
                  <Controller
                    name="cnpj"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <InputMask mask="99.999.999/9999-99" {...field}>
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="cnpj"
                            placeholder="00.000.000/0001-00"
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
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Controller
                  name="razaoSocial"
                  control={controlEmpresa}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="razaoSocial">Razão Social / Nome*</Label>
                      <Input id="razaoSocial" {...field} />
                      {empresaErrors.razaoSocial && (
                        <p className="text-red-500 text-sm mt-1">
                          {empresaErrors.razaoSocial.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="nomeFantasia"
                  control={controlEmpresa}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                      <Input id="nomeFantasia" {...field} />
                    </div>
                  )}
                />
              </div>
              <Separator />
              <h3 className="text-md font-semibold">Contato e Endereço</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Controller
                    name="telefone"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <InputMask mask="(99) 99999-9999" {...field}>
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            id="telefone"
                            placeholder="(79) 99999-9999"
                          />
                        )}
                      </InputMask>
                    )}
                  />
                </div>
                <Controller
                  name="email"
                  control={controlEmpresa}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" {...field} />
                      {empresaErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {empresaErrors.email.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Controller
                    name="cep"
                    control={controlEmpresa}
                    render={({ field }) => (
                      <InputMask
                        mask="99999-999"
                        {...field}
                        onBlur={(e) => handleCepBlur(e.target.value)}
                      >
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            id="cep"
                            placeholder="00000-000"
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
                <Controller
                  name="cidade"
                  control={controlEmpresa}
                  render={({ field }) => (
                    <div>
                      <Label>Cidade</Label>
                      <Input id="cidade" {...field} />
                    </div>
                  )}
                />
              </div>
              <div className="grid grid-cols-5 gap-4">
                <Controller
                  name="endereco"
                  control={controlEmpresa}
                  render={({ field }) => (
                    <div className="col-span-3">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" {...field} />
                    </div>
                  )}
                />
                <Controller
                  name="numero"
                  control={controlEmpresa}
                  render={({ field }) => (
                    <div className="col-span-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input id="numero" {...field} />
                    </div>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={!isEmpresaDirty || isEmpresaSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEmpresaSubmitting
                  ? "Salvando..."
                  : empresa
                  ? "Salvar Alterações"
                  : "Cadastrar Empresa"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Card de Cadastro de Usuários */}
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
              <Separator />
              <h4 className="font-semibold">Permissões de Acesso</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Controller
                  name="telasPermitidas"
                  control={controlUser}
                  render={({ field }) => (
                    <>
                      {availableScreens.map((screen) => (
                        <div
                          key={screen.key}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={screen.key}
                            checked={field.value?.includes(screen.key)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, screen.key])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== screen.key
                                    )
                                  );
                            }}
                          />
                          <Label
                            htmlFor={screen.key}
                            className="cursor-pointer"
                          >
                            {screen.title}
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
                {isUserSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Settings;
