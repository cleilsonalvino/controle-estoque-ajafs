
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RankingVendedor } from "@/types/pos-venda";
import { Star } from "lucide-react";

interface RankingVendedoresProps {
  data: RankingVendedor[];
}

const RankingVendedores = ({ data }: RankingVendedoresProps) => {
  // Sort data by average satisfaction, descending
  const sortedData = [...data].sort((a, b) => b.mediaSatisfacao - a.mediaSatisfacao);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Rank</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead className="text-right">Atendimentos</TableHead>
          <TableHead className="text-right">Média de Satisfação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((vendedor, index) => (
          <TableRow key={vendedor.vendedor.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{vendedor.vendedor.nome}</TableCell>
            <TableCell className="text-right">{vendedor.totalAtendimentos}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end">
                <span className="mr-1">{vendedor.mediaSatisfacao.toFixed(1)}</span>
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RankingVendedores;
