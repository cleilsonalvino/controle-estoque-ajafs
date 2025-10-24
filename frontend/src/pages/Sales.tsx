import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Sales = () => {
  const { createSale } = useSales();
  const { clientes } = useClientes();
  const { vendedores } = useVendedores();
  const { produtos } = useProdutos();

  const [mode, setMode] = useState<"menu" | "pdv">("menu");
  const [showCupom, setShowCupom] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [loadingService, setLoadingService] = useState(false);

  // Campos do formulário de serviço
  const [serviceData, setServiceData] = useState({
    clienteId: "",
    vendedorId: "",
    descricao: "",
    valor: "",
    formaPagamento: "",
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
        quantidade: item.quantity,
        precoUnitario: item.precoVenda,
      })),
    };

    try {
      await createSale(salePayload);
      setShowCupom(true);
      setLastSale({
        saleItems: saleData.saleItems,
        total: saleData.saleItems.reduce(
          (acc, item) => acc + (item.precoVenda || 0) * item.quantity,
          0
        ),
        discount: saleData.desconto,
        paymentMethod: saleData.formaPagamento,
      });
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message);
      return false;
    }
  };

  const handleRegisterService = async () => {
    const { clienteId, vendedorId, descricao, valor, formaPagamento } =
      serviceData;

    if (!vendedorId || !descricao || !valor || !formaPagamento) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoadingService(true);
    try {
      await createSale({
        clienteId: clienteId || undefined,
        vendedorId,
        desconto: 0,
        formaPagamento: formaPagamento,
        itens: [
          {
            produtoId: null,
            quantidade: 1,
            precoUnitario: Number(valor),
          },
        ],
      });
      toast.success("Serviço registrado com sucesso!");
      setIsServiceDialogOpen(false);
      setServiceData({
        clienteId: "",
        vendedorId: "",
        descricao: "",
        valor: "",
        formaPagamento: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar serviço.");
    } finally {
      setLoadingService(false);
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
        <DialogContent className="sm:max-w-lg">
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

            <div>
              <Label>Descrição do Serviço *</Label>
              <Input
                placeholder="Ex: Manutenção de Computador"
                value={serviceData.descricao}
                onChange={(e) =>
                  setServiceData({ ...serviceData, descricao: e.target.value })
                }
              />
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
    <Link to={'/'} className="text-primary">Voltar para o inicio</Link>
    </div>
  );
};

export default Sales;
