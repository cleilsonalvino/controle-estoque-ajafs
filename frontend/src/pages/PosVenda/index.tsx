
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PosVendaDataTable } from "@/components/pos-venda/PosVendaDataTable";
import { PlusCircle } from "lucide-react";

export default function PosVenda() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Acompanhamento Pós-Venda
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Criar Acompanhamento Manual
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input placeholder="Filtrar por cliente..." />
            <Input placeholder="Filtrar por vendedor..." />
            <Input type="date" placeholder="Filtrar por data..." />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
            <PosVendaDataTable />
        </CardContent>
      </Card>
    </div>
  );
}
