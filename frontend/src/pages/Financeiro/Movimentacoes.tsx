// src/pages/Financeiro/Movimentacoes.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { movimentacoesColumns } from "@/components/financeiro/MovimentacoesColumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MovimentacaoModal } from "@/components/financeiro/MovimentacaoModal";

const Movimentacoes: React.FC = () => {
  const { movimentacoes, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Movimentações Financeiras</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <Input placeholder="Buscar por descrição..." className="max-w-sm" />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button>Filtrar</Button>
          <div className="flex-grow" />
          <MovimentacaoModal open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button onClick={() => setIsModalOpen(true)}>Criar nova movimentação</Button>
          </MovimentacaoModal>
        </CardContent>
      </Card>

      <DataTable columns={movimentacoesColumns} data={movimentacoes} />
    </div>
  );
};

export default Movimentacoes;
