import { useState, useEffect } from "react";
import { useSales, SaleItem } from "@/contexts/SalesContext";
import { useClientes } from "@/contexts/ClienteContext";
import { useVendedores } from "@/contexts/VendedorContext";
import { useProdutos } from "@/contexts/ProdutoContext";
import CupomFiscal from "@/components/CupomFiscal";
import PDV from "./PDV";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  ShoppingCart,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "react-router-dom";
import { useTiposServicos } from "@/contexts/TiposServicosContext";
import { useServiceSales } from "@/contexts/ServiceSalesContext";

const Sales = () => {
  const { createSale, fetchSales } = useSales();
  const { clientes, fetchClientes } = useClientes();
  const { vendedores, fetchVendedores } = useVendedores();
  const { produtos, fetchProdutos } = useProdutos();
  const { tiposServicos, fetchTiposServicos } = useTiposServicos();
  const location = useLocation();

  // === REFRESH AUTOMÁTICO ===
  // 🔄 ALTERADO: Adicionadas todas as dependências de fetch no array
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchSales(),
        fetchClientes(),
        fetchVendedores(),
        fetchProdutos(),
        fetchTiposServicos(),
      ]);
    };

    // Roda ao abrir a rota
    fetchAll();

    // Atualiza ao voltar foco na aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAll().then(() => {
          toast.info("Dados atualizados automaticamente");
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    location.pathname,
    fetchSales,
    fetchClientes,
    fetchVendedores,
    fetchProdutos,
    fetchTiposServicos,
  ]);

  const [mode, setMode] = useState<"menu" | "pdv">("menu");
  const [showCupom, setShowCupom] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [loadingService, setLoadingService] = useState(false);
  const { createServiceSale } = useServiceSales();

  // Campos do formulário de serviço
  const [serviceData, setServiceData] = useState({
    clienteId: "",
    vendedorId: "",
    formaPagamento: "",
    valor: "0.00",
    tipoServicoId: "",
    descricao: "",
    itens: [{ servicoId: "", quantidade: 1, precoUnitario: 0, descricao: "" }],
  });

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

      // ✅ Só abre o cupom depois que o estado estiver definido
      setShowCupom(true);

      return true;
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao finalizar venda.");
      return false;
    }
  };

  const handleRegisterService = async () => {
    const { clienteId, vendedorId, formaPagamento, itens } = serviceData;

    if (!vendedorId || !formaPagamento || itens.length === 0) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    // 🔹 Verifica se todos os serviços foram selecionados corretamente
    for (const i of itens) {
      if (!i.servicoId || i.precoUnitario <= 0 || i.quantidade <= 0) {
        toast.error("Preencha corretamente os dados de todos os serviços.");
        return;
      }
    }

    const total = itens.reduce(
      (acc, i) => acc + Number(i.precoUnitario) * Number(i.quantidade),
      0
    );

    setLoadingService(true);
    try {
      await createServiceSale({
        clienteId: clienteId || undefined,
        vendedorId,
        formaPagamento,
        valor: total,
        tipoServicoId: "",
        descricao: "",
        itens: itens.map((i) => ({
          servicoId: i.servicoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
          descricao:
            i.descricao ||
            tiposServicos.find((t) => t.id === i.servicoId)?.nome ||
            "Serviço",
        })),
      });

      const vendedor = vendedores.find((v) => v.id === vendedorId);
      setLastSale({
        saleItems: itens.map((i) => ({
          nome:
            tiposServicos.find((t) => t.id === i.servicoId)?.nome ||
            i.descricao ||
            "Serviço",
          precoVenda: Number(i.precoUnitario),
          quantidade: Number(i.quantidade),
        })),
        total,
        discount: 0,
        vendedor: vendedor ? vendedor.nome : "—",
        paymentMethod: formaPagamento,
        dataHora: new Date().toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      });

      setShowCupom(true);

      toast.success("Serviços registrados com sucesso!");

      // ✅ Limpa e fecha o modal
      setServiceData({
        clienteId: "",
        vendedorId: "",
        formaPagamento: "",
        valor: "0.00",
        tipoServicoId: "",
        descricao: "",
        itens: [
          { servicoId: "", quantidade: 1, precoUnitario: 0, descricao: "" },
        ],
      });
      setIsServiceDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar serviços.");
    } finally {
      setLoadingService(false);
    }
  };

  const addServiceItem = () => {
    setServiceData((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        { servicoId: "", quantidade: 1, precoUnitario: 0, descricao: "" },
      ],
    }));
  };

  const updateServiceItem = (index: number, field: string, value: any) => {
    const newItems = [...serviceData.itens];
    (newItems[index] as any)[field] = value;
    setServiceData((prev) => ({ ...prev, itens: newItems }));
  };

  const removeServiceItem = (index: number) => {
    setServiceData((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* === PDV === */}
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Venda de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Registre vendas com controle de estoque e descontos.
            </p>
            <Button onClick={() => setMode("pdv")}>
              Abrir PDV
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </CardContent>
        </Card>

        {/* === Serviço === */}
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-primary" />
              Prestação de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Registre serviços prestados sem vínculo com estoque.
            </p>
            <Button
              onClick={() => setIsServiceDialogOpen(true)}
              variant="secondary"
            >
              Registrar Serviço
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* === MODAL DE SERVIÇO === */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Serviço</DialogTitle>
            <DialogDescription>
              Preencha as informações para registrar a prestação de serviço.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Cliente</Label>
              <Select
                value={serviceData.clienteId}
                onValueChange={(v) =>
                  setServiceData({ ...serviceData, clienteId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vendedor *</Label>
              <Select
                value={serviceData.vendedorId}
                onValueChange={(v) =>
                  setServiceData({ ...serviceData, vendedorId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {serviceData.itens.map((item, index) => (
                <Card key={index} className="p-4 relative">
                  <div className="absolute top-2 right-2">
                    {serviceData.itens.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeServiceItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <Label>Serviço</Label>
                      <Select
                        value={item.servicoId}
                        onValueChange={(v) =>
                          updateServiceItem(index, "servicoId", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposServicos.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          value={item.precoUnitario}
                          onChange={(e) =>
                            updateServiceItem(
                              index,
                              "precoUnitario",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) =>
                            updateServiceItem(
                              index,
                              "quantidade",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Ex: manutenção, instalação..."
                        value={item.descricao}
                        onChange={(e) =>
                          updateServiceItem(index, "descricao", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={addServiceItem}
              >
                + Adicionar outro serviço
              </Button>
            </div>

            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                placeholder="Ex: 150.00"
                value={serviceData.valor}
                onChange={(e) =>
                  setServiceData({ ...serviceData, valor: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Forma de Pagamento *</Label>
              <Select
                value={serviceData.formaPagamento}
                onValueChange={(v) =>
                  setServiceData({ ...serviceData, formaPagamento: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="debito">Cartão de Débito</SelectItem>
                  <SelectItem value="credito">Cartão de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServiceDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleRegisterService} disabled={loadingService}>
              {loadingService ? "Salvando..." : "Registrar Serviço"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Link to={"/"} className="text-primary">
        Voltar para o inicio
      </Link>
    </div>
  );
};

export default Sales;
