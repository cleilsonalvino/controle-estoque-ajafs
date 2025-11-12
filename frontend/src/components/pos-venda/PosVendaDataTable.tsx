
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./pos-venda-columns";
import { usePosVenda } from "@/contexts/PosVendaContext";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PosVendaDataTable() {
  const { posVendas, loading, fetchPosVendas } = usePosVenda();

  useEffect(() => {
    fetchPosVendas();
  }, [fetchPosVendas]);

  if (loading && posVendas.length === 0) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
  }

  return <DataTable columns={columns} data={posVendas} />;
}
