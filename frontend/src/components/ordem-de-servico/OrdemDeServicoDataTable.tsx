
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./ordem-de-servico-columns";
import { OrdemDeServico, StatusOrdemDeServico } from "@/types/ordem-de-servico";
import { useOrdemDeServico } from "@/contexts/OrdemDeServicoContext";

interface OrdemDeServicoDataTableProps {
  data: OrdemDeServico[];
}

export function OrdemDeServicoDataTable({
  data,
}: OrdemDeServicoDataTableProps) {
  const { updateOrdemDeServico } = useOrdemDeServico();

  const handleUpdateStatus = async (
    id: string,
    status: StatusOrdemDeServico
  ) => {
    await updateOrdemDeServico(id, { status });
  };

  const columns = getColumns(handleUpdateStatus);

  return <DataTable columns={columns} data={data} />;
}
