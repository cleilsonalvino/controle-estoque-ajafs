import { OrdemDeServicoDataTable } from "@/components/ordem-de-servico/OrdemDeServicoDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useOrdemDeServico } from "@/contexts/OrdemDeServicoContext";
import { useDebounce } from "@/hooks/useDebounce";
import { OrdemDeServico, StatusOrdemDeServico } from "@/types/ordem-de-servico";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrdemDeServicoPage() {
  const {
    ordensDeServico,
    loading,
    fetchOrdensDeServico,
    updateOrdemDeServico,
    deleteOrdemDeServico,
  } = useOrdemDeServico();

  const [filters, setFilters] = useState({
    cliente: "",
    responsavel: "",
    status: "",
  });

  const debouncedFilters = useDebounce(filters, 500);

  const [selectedOS, setSelectedOS] = useState<OrdemDeServico | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  console.log("OS", selectedOS);

  useEffect(() => {
    fetchOrdensDeServico(debouncedFilters);
  }, [debouncedFilters, fetchOrdensDeServico]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDetalhes = (os: OrdemDeServico) => {
    setSelectedOS(os);
    setObservacoes(os.observacoes || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOS(null);
  };

  const labelStatus: Record<StatusOrdemDeServico, string> = {
    PENDENTE: "Pendente",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDO: "Concluido",
    CANCELADO: "Cancelado",
  };

  const badgeVariant: Record<StatusOrdemDeServico, any> = {
    PENDENTE: "outline",
    EM_ANDAMENTO: "secondary",
    CONCLUIDO: "default",
    CANCELADO: "destructive",
  };

  const canAdvance =
    selectedOS &&
    (selectedOS.status === "PENDENTE" || selectedOS.status === "EM_ANDAMENTO");

  const handleAdvanceStatus = async () => {
    if (!selectedOS) return;

    let nextStatus: StatusOrdemDeServico | null = null;

    if (selectedOS.status === "PENDENTE") nextStatus = "EM_ANDAMENTO";
    else if (selectedOS.status === "EM_ANDAMENTO") nextStatus = "CONCLUIDO";

    if (!nextStatus) return;

    try {
      const updated = await updateOrdemDeServico(selectedOS.id, {
        status: nextStatus,
      });

      if (updated) {
        setSelectedOS(updated);
        toast.success("Status atualizado com sucesso.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status da ordem de servico.");
    }
  };

  
const handleDelete = async (os: OrdemDeServico) => {
  if (!confirm("Deseja realmente excluir esta ordem de serviço?")) return;

  await deleteOrdemDeServico(os.id);
  await fetchOrdensDeServico();
};

  const handleCancelarOS = async () => {
    if (!selectedOS) return;
    if (selectedOS.status === "CANCELADO") return;

    try {
      const updated = await updateOrdemDeServico(selectedOS.id, {
        status: "CANCELADO",
      });

      if (updated) {
        setSelectedOS(updated);
        toast.success("Ordem de servico cancelada.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cancelar ordem de servico.");
    }
  };

  const handleSalvarObservacoes = async () => {
    if (!selectedOS) return;

    try {
      const updated = await updateOrdemDeServico(selectedOS.id, {
        observacoes,
      });

      if (updated) {
        setSelectedOS(updated);
        toast.success("Observacoes atualizadas.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar observacoes.");
    }
  };

  const renderStatusCards = () => {
    if (!selectedOS) return null;

    const statuses: StatusOrdemDeServico[] = [
      "PENDENTE",
      "EM_ANDAMENTO",
      "CONCLUIDO",
      "CANCELADO",
    ];

    return (
      <div className="grid grid-cols-2 gap-3 mt-2">
        {statuses.map((st) => (
          <div
            key={st}
            className={`border rounded-md p-3 flex items-center justify-between ${
              selectedOS.status === st ? "bg-muted" : "bg-background"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{labelStatus[st]}</span>
              <span className="text-xs text-muted-foreground">
                {st === "PENDENTE" && "Aguardando inicio do atendimento."}
                {st === "EM_ANDAMENTO" && "Servico em execucao pela equipe."}
                {st === "CONCLUIDO" && "Servico finalizado e entregue."}
                {st === "CANCELADO" && "Ordem de servico cancelada."}
              </span>
            </div>
            <Badge variant={badgeVariant[st]}>{labelStatus[st]}</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Ordens de servico</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Filtrar por cliente"
              name="cliente"
              value={filters.cliente}
              onChange={handleFilterChange}
            />
            <Input
              placeholder="Filtrar por responsavel"
              name="responsavel"
              value={filters.responsavel}
              onChange={handleFilterChange}
            />
            <Select
              name="status"
              onValueChange={(value) =>
                handleSelectFilterChange("status", value)
              }
              value={filters.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                <SelectItem value="CONCLUIDO">Concluido</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading && ordensDeServico.length === 0 ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <OrdemDeServicoDataTable
              data={ordensDeServico}
              onView={handleOpenDetalhes}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes da ordem de servico */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

          {selectedOS && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>
                    Ordem de servico{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      #{selectedOS.id}
                    </span>
                  </span>
                  <Badge variant={badgeVariant[selectedOS.status]}>
                    {labelStatus[selectedOS.status]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 mt-2">
                {/* Dados principais */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        Dados do cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Nome: </span>
                        {selectedOS.cliente?.nome || "Nao informado"}
                      </p>
                      <p>
                        <span className="font-medium">Email: </span>
                        {selectedOS.cliente?.email || "Nao informado"}
                      </p>
                      <p>
                        <span className="font-medium">Telefone: </span>
                        {selectedOS.cliente?.telefone || "Nao informado"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        Informacoes da ordem
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Responsavel: </span>
                        {selectedOS.responsavel?.nome || "Nao definido"}
                      </p>
                      <p>
                        <span className="font-medium">Servico: </span>
                        {selectedOS.servico?.nome || "Nao informado"}
                      </p>
                      <p>
                        <span className="font-medium">Criado em: </span>
                        {new Date(selectedOS.criadoEm).toLocaleString("pt-BR")}
                      </p>
                      <p>
                        <span className="font-medium">Atualizado em: </span>
                        {new Date(selectedOS.atualizadoEm).toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Status em formato de cartoes */}
                <div>
                  <h2 className="text-sm font-semibold">Situacao da ordem</h2>
                  {renderStatusCards()}
                </div>

                <div>
                  <h2 className="text-sm font-semibold mb-1">
                    Identificação
                  </h2>
                  <p className="text-sm border rounded-md p-2 bg-muted">
                    {selectedOS.identificacaoItem ||
                      "Nao há identificacao do problema na venda vinculada."}
                  </p>
                </div>

                {/* Problema relatado */}
                <div>
                  <h2 className="text-sm font-semibold mb-1">
                    Problema relatado
                  </h2>
                  <p className="text-sm border rounded-md p-2 bg-muted">
                    {selectedOS.problemaRelatado ||
                      "Nao ha descricao do problema na venda vinculada."}
                  </p>
                </div>

                {/* Observacoes internas */}
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">
                    Observacoes internas
                  </h2>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Use este campo para registrar informacoes internas da equipe tecnica."
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSalvarObservacoes}
                    >
                      Salvar observacoes
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex justify-between gap-3">
                <Button variant="outline" onClick={handleCloseModal}>
                  Fechar
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleCancelarOS}
                    disabled={selectedOS.status === "CANCELADO"}
                  >
                    Cancelar ordem
                  </Button>

                  <Button onClick={handleAdvanceStatus} disabled={!canAdvance}>
                    Avancar etapa
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
