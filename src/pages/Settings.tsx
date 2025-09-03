import { useState } from "react";
import { Settings as SettingsIcon, Save, Bell, Shield, Database, Palette, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Empresa
    companyName: "Minha Empresa",
    companyEmail: "contato@minhaempresa.com",
    companyPhone: "(11) 99999-9999",
    
    // Notificações
    emailNotifications: true,
    stockAlerts: true,
    lowStockThreshold: "10",
    dailyReports: false,
    
    // Sistema
    autoSave: true,
    backupFrequency: "daily",
    theme: "system",
    language: "pt-BR",
    
    // Estoque
    defaultMinStock: "5",
    currencySymbol: "R$",
    taxRate: "18",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Aqui você salvaria as configurações
    toast({
      title: "Configurações salvas!",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <SettingsIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Personalize o sistema conforme suas necessidades</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Informações da Empresa */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Dados básicos da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => handleSettingChange("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email da Empresa</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleSettingChange("companyEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Telefone</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => handleSettingChange("companyPhone", e.target.value)}
                className="md:w-1/2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-gradient-card border-0 shadow-md">
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
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
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
                checked={settings.stockAlerts}
                onCheckedChange={(checked) => handleSettingChange("stockAlerts", checked)}
              />
            </div>

            {settings.stockAlerts && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="lowStockThreshold">Limite de Estoque Baixo</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleSettingChange("lowStockThreshold", e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Alertar quando quantidade for menor ou igual a este valor
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
                checked={settings.dailyReports}
                onCheckedChange={(checked) => handleSettingChange("dailyReports", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
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
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequência de Backup</Label>
                <Select 
                  value={settings.backupFrequency} 
                  onValueChange={(value) => handleSettingChange("backupFrequency", value)}
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
                  value={settings.language} 
                  onValueChange={(value) => handleSettingChange("language", value)}
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
        </Card>

        {/* Estoque */}
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
                  value={settings.defaultMinStock}
                  onChange={(e) => handleSettingChange("defaultMinStock", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currencySymbol">Símbolo da Moeda</Label>
                <Input
                  id="currencySymbol"
                  value={settings.currencySymbol}
                  onChange={(e) => handleSettingChange("currencySymbol", e.target.value)}
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
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange("taxRate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
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