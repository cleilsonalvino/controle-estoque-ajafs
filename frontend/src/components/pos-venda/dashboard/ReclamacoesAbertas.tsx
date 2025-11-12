
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reclamacao } from "@/types/pos-venda";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ReclamacoesAbertasProps {
  data: Reclamacao[];
}

const ReclamacoesAbertas = ({ data }: ReclamacoesAbertasProps) => {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma reclamação em aberto. Bom trabalho!</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((reclamacao) => (
          <TableRow key={reclamacao.id} className="border-l-4 border-destructive">
            <TableCell className="font-medium">{reclamacao.cliente.nome}</TableCell>
            <TableCell className="max-w-xs truncate">{reclamacao.motivo}</TableCell>
            <TableCell>{new Date(reclamacao.dataReclamacao).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                    <Link to={`/pos-venda/${reclamacao.id}`}>Ver Detalhes</Link>
                </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReclamacoesAbertas;
