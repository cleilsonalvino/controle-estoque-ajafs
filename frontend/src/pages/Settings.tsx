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
  const { empresa, loading, createEmpresa, updateEmpresa } = useEmpresa();
  
  const [formData, setFormData] = useState<Partial<Empresa & { emailNotifications: boolean, stockAlerts: boolean, lowStockThreshold: string, dailyReports: boolean, autoSave: boolean, backupFrequency: string, theme: string, language: string, defaultMinStock: string, currencySymbol: string, taxRate: string }>>({});

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
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você quer ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações importantes por email
                </p>
              </div>
              <Switch
                checked={formData.emailNotifications || false}
                onCheckedChange={(checked) => handleFormChange("emailNotifications", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Estoque Baixo</Label>
                <p className="text-sm text-muted-foreground">
                  Seja notificado quando produtos estiverem com estoque baixo
                </p>
              </div>
              <Switch
                checked={formData.stockAlerts || false}
                onCheckedChange={(checked) => handleFormChange("stockAlerts", checked)}
              />
            </div>

            {formData.stockAlerts && (
              <div className="space-y-2 pl-4 border-l-2 ml-2">
                <Label htmlFor="lowStockThreshold">Limite para Alerta de Estoque Baixo</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold || ""}
                  onChange={(e) => handleFormChange("lowStockThreshold", e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Alertar quando a quantidade for menor ou igual a este valor.
                </p>
              </div>
            )}
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatórios Diários</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo diário por email
                </p>
              </div>
              <Switch
                checked={formData.dailyReports || false}
                onCheckedChange={(checked) => handleFormChange("dailyReports", checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveNotifications}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Salvamento Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Salvar alterações automaticamente
                </p>
              </div>
              <Switch
                checked={formData.autoSave || false}
                onCheckedChange={(checked) => handleFormChange("autoSave", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequência de Backup</Label>
                <Select 
                  value={formData.backupFrequency || ""} 
                  onValueChange={(value) => handleFormChange("backupFrequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select 
                  value={formData.language || ""} 
                  onValueChange={(value) => handleFormChange("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveSystem}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Estoque
            </CardTitle>
            <CardDescription>
              Configurações padrão para produtos e estoque
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="defaultMinStock">Estoque Mínimo Padrão</Label>
                <Input
                  id="defaultMinStock"
                  type="number"
                  min="0"
                  value={formData.defaultMinStock || ""}
                  onChange={(e) => handleFormChange("defaultMinStock", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currencySymbol">Símbolo da Moeda</Label>
                <Input
                  id="currencySymbol"
                  value={formData.currencySymbol || ""}
                  onChange={(e) => handleFormChange("currencySymbol", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">Taxa de Imposto (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate || ""}
                  onChange={(e) => handleFormChange("taxRate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveStock}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Versão do Sistema</Label>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <div className="space-y-2">
                <Label>Última Atualização</Label>
                <p className="text-sm text-muted-foreground">15 de Janeiro, 2024</p>
              </div>
              <div className="space-y-2">
                <Label>Licença</Label>
                <Badge variant="success">Ativa</Badge>
              </div>
              <div className="space-y-2">
                <Label>Suporte</Label>
                <p className="text-sm text-muted-foreground">Premium até 15/01/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};

export default Settings;
