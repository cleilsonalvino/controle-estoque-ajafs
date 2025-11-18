import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./pos-venda-columns";
import { PosVenda } from "@/types/pos-venda";
import { usePosVenda } from "@/contexts/PosVendaContext";
import { useState } from "react";
import { AgendarFollowUpModal } from "./AgendarFollowUpModal";

interface PosVendaDataTableProps {
  data: PosVenda[];
}

export function PosVendaDataTable({ data }: PosVendaDataTableProps) {
  const { finalizarAtendimento } = usePosVenda();
  const [selectedPosVendaId, setSelectedPosVendaId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAgendarFollowUp = (id: string) => {
    setSelectedPosVendaId(id);
    setIsModalOpen(true);
  };

  const columns = getColumns(finalizarAtendimento, handleAgendarFollowUp);

  // 🔥 FILTRO: remove vendas SEM cliente
  const filteredData = data.filter(
    (pv) =>
      pv.cliente &&
      pv.cliente.nome &&
      pv.cliente.nome.trim().length > 0
  );

  return (
    <>
      <DataTable columns={columns} data={filteredData} />

      {selectedPosVendaId && (
        <AgendarFollowUpModal
          posVendaId={selectedPosVendaId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
