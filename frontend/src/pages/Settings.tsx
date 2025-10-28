import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Bell, Shield, Database, Palette, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEmpresa, Empresa } from "@/contexts/EmpresaContext";
import { useLocation } from "react-router-dom";
import { toast as sonnerToast } from "sonner";

const estadosBrasileiros = [
  { sigla: "AC", nome: "Acre" }, { sigla: "AL", nome: "Alagoas" }, { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" }, { sigla: "BA", nome: "Bahia" }, { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" }, { sigla: "ES", nome: "Espírito Santo" }, { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" }, { sigla: "MT", nome: "Mato Grosso" }, { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" }, { sigla: "PA", nome: "Pará" }, { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" }, { sigla: "PE", nome: "Pernambuco" }, { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" }, { sigla: "RN", nome: "Rio Grande do Norte" }, { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" }, { sigla: "RR", nome: "Roraima" }, { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" }, { sigla: "SE", nome: "Sergipe" }, { sigla: "TO", nome: "Tocantins" }
];

const Settings = () => {
  const { toast } = useToast();
  const { empresa, loading, createEmpresa, updateEmpresa, fetchEmpresa } = useEmpresa();
  const location = useLocation();
  
  const [formData, setFormData] = useState<Partial<Empresa >>({});

  // === REFRESH AUTOMÁTICO ===
  useEffect(() => {
    const fetchAll = async () => {
      await fetchEmpresa();
    };

    // Roda ao abrir a rota
    fetchAll();

    // Atualiza ao voltar foco na aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => {
          sonnerToast.info("Dados atualizados automaticamente");
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (empresa) {
      setFormData(empresa);
    }
  }, [empresa]);

  const handleFormChange = (key: any, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEmpresa = async () => {
    if (!empresa) {
      await updateEmpresa(formData);
    } else {
      await createEmpresa(formData as Omit<Empresa, "id">);
    }
  };

  const handleSaveNotifications = async () => {
    await updateEmpresa(formData);
  };

  const handleSaveSystem = async () => {
    await updateEmpresa(formData);
  };

  const handleSaveStock = async () => {
    await updateEmpresa(formData);
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-lg text-primary-foreground">
              <SettingsIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
              <p className="text-muted-foreground">Personalize o sistema conforme suas necessidades</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Dados cadastrais, fiscais e de contato da sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="cnpj">CNPJ / CPF</Label>
                <div className="flex gap-2">
                  <Input
                    id="cnpj"
                    value={formData.cnpj || ""}
                    onChange={(e) => handleFormChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social / Nome</Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial || ""}
                  onChange={(e) => handleFormChange("razaoSocial", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={formData.nomeFantasia || ""}
                  onChange={(e) => handleFormChange("nomeFantasia", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                <Label htmlFor="inscEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscEstadual"
                  value={formData.inscEstadual || ""}
                  onChange={(e) => handleFormChange("inscEstadual", e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="inscMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscMunicipal"
                  value={formData.inscMunicipal || ""}
                  onChange={(e) => handleFormChange("inscMunicipal", e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="cnae">CNAE Principal</Label>
                <Input
                  id="cnae"
                  value={formData.cnae || ""}
                  onChange={(e) => handleFormChange("cnae", e.target.value)}
                />
              </div>
            </div>
            
            <Separator />

            <h3 className="text-md font-semibold text-foreground">Contato e Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ""}
                  onChange={(e) => handleFormChange("telefone", e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                 <div className="flex gap-2">
                  <Input
                    id="cep"
                    value={formData.cep || ""}
                    onChange={(e) => handleFormChange("cep", e.target.value)}
                  />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label>Estado</Label>
                 <Select value={formData.estado || ""} onValueChange={(value) => handleFormChange("estado", value)}>
                   <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                   <SelectContent>
                     {estadosBrasileiros.map(uf => (
                       <SelectItem key={uf.sigla} value={uf.sigla}>{uf.nome}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label>Cidade</Label>
                 <Input
                    id="cidade"
                    value={formData.cidade || ""}
                    onChange={(e) => handleFormChange("cidade", e.target.value)}
                 />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="endereco">Endereço (Rua, Av.)</Label>
                <Input
                  id="endereco"
                  value={formData.endereco || ""}
                  onChange={(e) => handleFormChange("endereco", e.target.value)}
                />
              </div>
               <div className="md:col-span-2 space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ""}
                  onChange={(e) => handleFormChange("numero", e.target.value)}
                />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento || ""}
                  onChange={(e) => handleFormChange("complemento", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro || ""}
                  onChange={(e) => handleFormChange("bairro", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveEmpresa}>
              <Save className="h-4 w-4 mr-2" />
              {empresa ? "Salvar" : "Cadastrar"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
         <CardHeader>
          <CardTitle>Cadastrar novo usuário</CardTitle>
         </CardHeader>
         <CardContent>
          <Label>Nome usuario</Label>
          <Input />
          <Label>Email</Label>
          <Input />
          <Label>Senha</Label>
          <Input />
          <Label>Confirmar senha</Label>
          <Input />
          
         </CardContent>
         <CardFooter>
          <Button>Cadastrar</Button>
         </CardFooter>

          
        </Card>


      </div>
    </div>
  );
};

export default Settings;
