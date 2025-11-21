import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdemDeServico, StatusOrdemDeServico } from "@/types/ordem-de-servico";
import { Eye, Trash2 } from "lucide-react";

interface OrdemDeServicoDataTableProps {
  data: OrdemDeServico[];
  onView: (os: OrdemDeServico) => void;
  onDelete: (os: OrdemDeServico) => void;
}


const statusLabel: Record<StatusOrdemDeServico, string> = {
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

export function OrdemDeServicoDataTable({
  data,
  onView,
  onDelete,
}: OrdemDeServicoDataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Nenhuma ordem de servico encontrada.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Codigo</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Responsavel</TableHead>
          <TableHead>Servico</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((os) => (
          <TableRow key={os.id}>
            <TableCell className="font-mono text-xs">
              #{os.id.slice(0, 8) || "SEM CÓDIGO"}
            </TableCell>
            <TableCell>{os.cliente?.nome || "Nao informado"}</TableCell>
            <TableCell>{os.responsavel?.nome || "Nao definido"}</TableCell>
            <TableCell>{os.servico?.nome || "Nao informado"}</TableCell>
            <TableCell>
              <Badge variant={badgeVariant[os.status]}>
                {statusLabel[os.status]}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(os.criadoEm).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(os)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Detalhes
              </Button>
              <Button
  size="sm"
  variant="destructive"
  className="ml-2"
  onClick={() => onDelete(os)}
>
  <Trash2 className="h-4 w-4 mr-1" />
  Excluir
</Button>

            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
