
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrdemDeServico } from "@/contexts/OrdemDeServicoContext";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdemDeServicoDataTable } from "@/components/ordem-de-servico/OrdemDeServicoDataTable";

export default function OrdemDeServicoPage() {
  const { ordensDeServico, loading, fetchOrdensDeServico } = useOrdemDeServico();
  const [filters, setFilters] = useState({
    cliente: "",
    responsavel: "",
    status: "",
  });

  const debouncedFilters = useDebounce(filters, 500);

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

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Ordens de Serviço
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Filtrar por cliente..."
              name="cliente"
              value={filters.cliente}
              onChange={handleFilterChange}
            />
            <Input
              placeholder="Filtrar por responsável..."
              name="responsavel"
              value={filters.responsavel}
              onChange={handleFilterChange}
            />
            <Select
              name="status"
              onValueChange={(value) => handleSelectFilterChange("status", value)}
              value={filters.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
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
            <OrdemDeServicoDataTable data={ordensDeServico} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
