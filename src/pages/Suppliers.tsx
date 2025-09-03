import { useState } from "react";
import { Users, Plus, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: "ativo" | "inativo";
  products: string[];
  lastOrder?: string;
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "TechStore Distribuidora",
      contact: "João Santos",
      email: "joao@techstore.com",
      phone: "(11) 98765-4321",
      address: "Rua da Tecnologia, 123 - São Paulo/SP",
      status: "ativo",
      products: ["Smartphones", "Notebooks", "Acessórios"],
      lastOrder: "2024-01-10"
    },
    {
      id: "2", 
      name: "Móveis & Cia",
      contact: "Maria Silva",
      email: "contato@moveisecia.com",
      phone: "(11) 91234-5678",
      address: "Av. dos Móveis, 456 - São Paulo/SP",
      status: "ativo",
      products: ["Mesas", "Cadeiras", "Armários"],
      lastOrder: "2024-01-05"
    },
    {
      id: "3",
      name: "InfoParts",
      contact: "Carlos Oliveira",
      email: "vendas@infoparts.com",
      phone: "(11) 95555-7777",
      address: "Rua dos Componentes, 789 - São Paulo/SP",
      status: "inativo",
      products: ["Componentes", "Periféricos"],
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    products: "",
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = () => {
    if (!formData.name || !formData.contact) return;

    const supplier: Supplier = {
      id: Date.now().toString(),
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      status: "ativo",
      products: formData.products.split(",").map(p => p.trim()).filter(p => p),
    };

    setSuppliers([...suppliers, supplier]);
    resetForm();
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier || !formData.name || !formData.contact) return;

    const updatedSupplier: Supplier = {
      ...editingSupplier,
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      products: formData.products.split(",").map(p => p.trim()).filter(p => p),
    };

    setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
    resetForm();
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const toggleSupplierStatus = (id: string) => {
    setSuppliers(suppliers.map(s => 
      s.id === id 
        ? { ...s, status: s.status === "ativo" ? "inativo" : "ativo" }
        : s
    ));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      products: "",
    });
    setShowAddDialog(false);
    setEditingSupplier(null);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      products: supplier.products.join(", "),
    });
    setShowAddDialog(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
              <p className="text-muted-foreground">Gerencie seus fornecedores e parceiros</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6 bg-gradient-card border-0 shadow-md">
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="group hover:shadow-lg transition-all duration-300 border bg-gradient-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {supplier.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Contato: {supplier.contact}
                  </CardDescription>
                </div>
                <Badge 
                  variant={supplier.status === "ativo" ? "success" : "destructive"}
                  className="shrink-0 cursor-pointer"
                  onClick={() => toggleSupplierStatus(supplier.id)}
                >
                  {supplier.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="line-clamp-1">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{supplier.address}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Produtos:</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.products.slice(0, 3).map((product, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                  {supplier.products.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{supplier.products.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {supplier.lastOrder && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                  Último pedido: {new Date(supplier.lastOrder).toLocaleDateString('pt-BR')}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(supplier)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Tente ajustar os termos de pesquisa."
                : "Adicione seu primeiro fornecedor para começar."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={showAddDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier 
                ? "Faça as alterações necessárias no fornecedor."
                : "Preencha as informações do novo fornecedor."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input
                  placeholder="Ex: TechStore Ltda"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Pessoa de Contato</Label>
                <Input
                  placeholder="Ex: João Silva"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                placeholder="Rua, número, cidade/estado"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Produtos (separados por vírgula)</Label>
              <Input
                placeholder="Ex: Eletrônicos, Móveis, Acessórios"
                value={formData.products}
                onChange={(e) => setFormData(prev => ({ ...prev, products: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
              className="bg-gradient-primary hover:opacity-90"
            >
              {editingSupplier ? "Salvar Alterações" : "Adicionar Fornecedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;