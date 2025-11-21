// =======================================
// SALES COMPLETO COM MODAL DE TIPO DE SERVIÇO IGUAL AO ORIGINAL
// =======================================
import { useState, useEffect } from "react";
import { useSales, SaleItem } from "@/contexts/SalesContext";
import { useClientes } from "@/contexts/ClienteContext";
import { useVendedores } from "@/contexts/VendedorContext";
import { useProdutos } from "@/contexts/ProdutoContext";
import { useAuth } from "@/contexts/useAuth";
import { useOrdemDeServico } from "@/contexts/OrdemDeServicoContext";
import { useTiposServicos } from "@/contexts/TiposServicosContext";
import { useServiceCategories } from "@/contexts/ServiceCategoryContext";

import CupomFiscal from "@/components/CupomFiscal";
import PDV from "./PDV";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { ShoppingCart, Briefcase, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";

const Sales = () => {
  const { createSale, fetchSales } = useSales();
  const { clientes, fetchClientes, createCliente } = useClientes();
  const { vendedores, fetchVendedores } = useVendedores();
  const { produtos, fetchProdutos } = useProdutos();
  const { user } = useAuth();

  const { createOrdemDeServico } = useOrdemDeServico();

  const {
    tiposServicos,
    fetchTiposServicos,
    createTipoServico,
  } = useTiposServicos();

  const { serviceCategories, fetchServiceCategories } = useServiceCategories();

  const location = useLocation();

  // Atualização automática ao retornar à aba
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchSales(),
        fetchClientes(),
        fetchVendedores(),
        fetchProdutos(),
        fetchTiposServicos(),
        fetchServiceCategories(),
      ]);
    };

    fetchAll();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => toast.info("Dados atualizados automaticamente"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [
    location.pathname,
    fetchSales,
    fetchClientes,
    fetchVendedores,
    fetchProdutos,
    fetchTiposServicos,
    fetchServiceCategories,
  ]);

  const [mode, setMode] = useState<"menu" | "pdv">("menu");
  const [showCupom, setShowCupom] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  // ORDEM DE SERVIÇO
  const [isOSDialogOpen, setIsOSDialogOpen] = useState(false);
  const [loadingOS, setLoadingOS] = useState(false);

  const initialOsData = {
    clienteId: "",
    cpf: "",
    telefone: "",
    endereco: "",
    responsavelId: user?.id || "",
    tipoServicoId: "",
    identificacaoItem: "",
    problemaRelatado: "",
    observacoes: "",
  };

  const [osData, setOsData] = useState(initialOsData);

  // Novo cliente
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  // Novo tipo de serviço
  const [isNewTipoDialogOpen, setIsNewTipoDialogOpen] = useState(false);
  const [formTipo, setFormTipo] = useState({
    nome: "",
    descricao: "",
    precoCusto: 0,
    precoVenda: 0,
    duracaoMinutos: 0,
    categoriaId: "",
  });

  // Finalizar venda
  const handleFinalizeSale = async (saleData: {
    saleItems: SaleItem[];
    clienteId?: string;
    vendedorId: string;
    desconto: number;
    formaPagamento: string;
  }) => {
    const salePayload = {
      clienteId: saleData.clienteId,
      vendedorId: saleData.vendedorId,
      desconto: saleData.desconto,
      formaPagamento: saleData.formaPagamento,
      itens: saleData.saleItems.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantidade,
        precoUnitario: item.precoVenda,
      })),
    };

    try {
      await createSale(salePayload);
      const vendedor = vendedores.find((v) => v.id === saleData.vendedorId);

      setLastSale({
        saleItems: saleData.saleItems,
        total: saleData.saleItems.reduce(
          (acc, item) => acc + (item.precoVenda || 0) * item.quantidade,
          0
        ),
        discount: saleData.desconto,
        paymentMethod: saleData.formaPagamento,
        vendedor: vendedor ? vendedor.nome : "—",
        dataHora: new Date().toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      });

      setShowCupom(true);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao finalizar venda.");
      return false;
    }
  };

  // Criar OS
  const handleCriarOS = async () => {
    if (
      !osData.clienteId ||
      !osData.responsavelId ||
      !osData.tipoServicoId ||
      !osData.problemaRelatado.trim()
    ) {
      toast.error("Preencha os campos obrigatórios da ordem de serviço.");
      return;
    }

    setLoadingOS(true);

    try {
      await createOrdemDeServico({
        clienteId: osData.clienteId,
        responsavelId: osData.responsavelId || user?.id,
        servicoId: osData.tipoServicoId,
        identificacaoItem: osData.identificacaoItem || undefined,
        problemaRelatado: osData.problemaRelatado,
        observacoes: osData.observacoes || undefined,
      } as any);

      toast.success("Ordem de serviço criada com sucesso.");
      setOsData(initialOsData);
      setIsOSDialogOpen(false);
    } catch (err) {
      toast.error("Erro ao criar ordem de serviço.");
    } finally {
      setLoadingOS(false);
    }
  };

  // Criar novo tipo de serviço
  const handleCreateTipoServico = async () => {
    if (!formTipo.nome.trim()) {
      toast.error("Informe o nome do tipo de serviço.");
      return;
    }

    const novo = await createTipoServico({
      nome: formTipo.nome,
      descricao: formTipo.descricao,
      precoCusto: Number(formTipo.precoCusto) || 0,
      precoVenda: Number(formTipo.precoVenda) || 0,
      duracaoMinutos: Number(formTipo.duracaoMinutos) || 0,
      categoriaId: formTipo.categoriaId || null,
    });

    if (novo) {
      toast.success("Tipo de serviço criado!");
      setOsData((prev) => ({
        ...prev,
        tipoServicoId: novo.id,
      }));
      setIsNewTipoDialogOpen(false);
      setFormTipo({
        nome: "",
        descricao: "",
        precoCusto: 0,
        precoVenda: 0,
        duracaoMinutos: 0,
        categoriaId: "",
      });
    }
  };

  if (mode === "pdv") {
    return (
      <>
        {showCupom && lastSale && (
          <CupomFiscal {...lastSale} onClose={() => setShowCupom(false)} />
        )}
        <PDV
          clientes={clientes}
          vendedores={vendedores}
          onFinalizeSale={handleFinalizeSale}
          onExit={() => setMode("menu")}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Central de Vendas
      </h1>

      {/* MENU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Venda de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setMode("pdv")}>
              Abrir PDV <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-primary" />
              Ordem de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={() => setIsOSDialogOpen(true)}>
              Iniciar OS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MODAL OS */}
      <Dialog open={isOSDialogOpen} onOpenChange={setIsOSDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* CLIENTE */}
            <div>
              <Label>Cliente *</Label>
              <div className="flex gap-2 items-center">
                <Select
                  value={osData.clienteId}
                  onValueChange={(v) =>
                    setOsData({ ...osData, clienteId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsNewClientDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* RESPONSÁVEL */}
            <div>
              <Label>Responsável</Label>
              <Input disabled value={user?.nome || ""} />
            </div>

            {/* TIPO SERVIÇO */}
            <div>
              
              <Label>Tipo de Serviço *</Label>
              <div className="flex gap-2">
                <Select
                  value={osData.tipoServicoId}
                  onValueChange={(v) =>
                    setOsData({ ...osData, tipoServicoId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServicos.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsNewTipoDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ITEM */}
            <div>
              <Label>Identificação do Item</Label>
              <Input
                placeholder="Modelo, IMEI, placa..."
                value={osData.identificacaoItem}
                onChange={(e) =>
                  setOsData({
                    ...osData,
                    identificacaoItem: e.target.value,
                  })
                }
              />
            </div>

            {/* PROBLEMA */}
            <div>
              <Label>Problema *</Label>
              <Textarea
                placeholder="Descreva o problema"
                value={osData.problemaRelatado}
                onChange={(e) =>
                  setOsData({
                    ...osData,
                    problemaRelatado: e.target.value,
                  })
                }
              />
            </div>

            {/* OBSERVAÇÕES */}
            <div>
              <Label>Observações</Label>
              <Textarea
                value={osData.observacoes}
                onChange={(e) =>
                  setOsData({ ...osData, observacoes: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOSDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarOS} disabled={loadingOS}>
              {loadingOS ? "Salvando..." : "Criar OS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE NOVO CLIENTE */}
<Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Novo Cliente</DialogTitle>
      <DialogDescription>
        Cadastre um novo cliente para continuar o atendimento.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {/* Nome */}
      <div>
        <Label>Nome *</Label>
        <Input
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
        />
      </div>

      {/* CPF */}
      <div>
        <Label>CPF</Label>
        <Input
          value={osData.cpf}
          onChange={(e) => setOsData({ ...osData, cpf: e.target.value })}
          placeholder="000.000.000-00"
        />
      </div>

      {/* Telefone */}
      <div>
        <Label>Telefone</Label>
        <Input
          value={osData.telefone}
          onChange={(e) => setOsData({ ...osData, telefone: e.target.value })}
          placeholder="(79) 99999-9999"
        />
      </div>

      {/* Endereço */}
      <div>
        <Label>Endereço</Label>
        <Input
          value={osData.endereco}
          onChange={(e) => setOsData({ ...osData, endereco: e.target.value })}
          placeholder="Rua, número e bairro"
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>
        Cancelar
      </Button>

      <Button
        onClick={async () => {
          if (!newClientName.trim()) {
            toast.error("Informe o nome do cliente.");
            return;
          }

          try {
            const novoCliente = await createCliente({
              nome: newClientName,
              cpf: osData.cpf || undefined,
              telefone: osData.telefone || undefined,
              endereco: osData.endereco || undefined,
            });

            if (novoCliente) {
              toast.success("Cliente criado!");

              setOsData((prev) => ({
                ...prev,
                clienteId: novoCliente.id,
              }));

              setNewClientName("");
              setIsNewClientDialogOpen(false);
            }
          } catch (err) {
            toast.error("Erro ao criar cliente.");
          }
        }}
      >
        Salvar Cliente
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* MODAL DE NOVO TIPO DE SERVIÇO — MODELO COMPLETO */}
      <Dialog open={isNewTipoDialogOpen} onOpenChange={setIsNewTipoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Tipo de Serviço</DialogTitle>
            <DialogDescription>
              Preencha todos os detalhes do tipo de serviço.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* NOME */}
            <div>
              <Label>Nome *</Label>
              <Input
                value={formTipo.nome}
                onChange={(e) =>
                  setFormTipo({ ...formTipo, nome: e.target.value })
                }
              />
            </div>

            {/* DESCRIÇÃO */}
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formTipo.descricao}
                onChange={(e) =>
                  setFormTipo({ ...formTipo, descricao: e.target.value })
                }
              />
            </div>

            {/* PREÇOS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço de Custo</Label>
                <Input
                  type="number"
                  value={formTipo.precoCusto}
                  onChange={(e) =>
                    setFormTipo({
                      ...formTipo,
                      precoCusto: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Preço de Venda</Label>
                <Input
                  type="number"
                  value={formTipo.precoVenda}
                  onChange={(e) =>
                    setFormTipo({
                      ...formTipo,
                      precoVenda: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* DURAÇÃO */}
            <div>
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                value={formTipo.duracaoMinutos}
                onChange={(e) =>
                  setFormTipo({
                    ...formTipo,
                    duracaoMinutos: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* CATEGORIA */}
            <div>
              <Label>Categoria</Label>
              <Select
                value={formTipo.categoriaId}
                onValueChange={(v) =>
                  setFormTipo({ ...formTipo, categoriaId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTipoDialogOpen(false)}>
              Cancelar
            </Button>

            <Button onClick={handleCreateTipoServico}>
              Salvar Tipo de Serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Link to="/" className="text-primary block mt-6">
        Voltar ao início
      </Link>
    </div>
  );
};

export default Sales;
