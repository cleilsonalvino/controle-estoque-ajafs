import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PosVendaDataTable } from "@/components/pos-venda/PosVendaDataTable";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { usePosVenda } from "@/contexts/PosVendaContext";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { CriarAcompanhamentoModal } from "@/components/pos-venda/CriarAcompanhamentoModal";

// 🔧 Controle da tela — coloque FALSE quando quiser liberar
const EM_CONSTRUCAO = true;

export default function PosVenda() {
  const { posVendas, loading, fetchPosVendas } = usePosVenda();
  const [filters, setFilters] = useState({
    cliente: "",
    vendedor: "",
    data: "",
    status: "",
  });

  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    fetchPosVendas(debouncedFilters);
  }, [debouncedFilters, fetchPosVendas]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 relative">

      {/* 🔥 Overlay EM CONSTRUÇÃO */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-50
            backdrop-blur-md bg-white/70
            flex flex-col items-center justify-center
            rounded-lg
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4" />
          <h2 className="text-3xl font-semibold text-gray-800">Em Construção</h2>
          <p className="mt-2 text-gray-700 text-sm max-w-sm text-center">
            Estamos configurando o módulo de Pós-Venda para oferecer a melhor experiência possível.
          </p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Acompanhamento Pós-Venda
        </h1>

        <CriarAcompanhamentoModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Acompanhamento Manual
          </Button>
        </CriarAcompanhamentoModal>
      </div>

      {/* FILTROS */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Filtrar por cliente..."
              name="cliente"
              value={filters.cliente}
              onChange={handleFilterChange}
            />
            <Input
              placeholder="Filtrar por vendedor..."
              name="vendedor"
              value={filters.vendedor}
              onChange={handleFilterChange}
            />
            <Input
              type="date"
              name="data"
              value={filters.data}
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
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* TABELA */}
      <Card>
        <CardContent className="p-0">
          {loading && posVendas.length === 0 ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <PosVendaDataTable data={posVendas} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
