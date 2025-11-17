// src/pages/Financeiro/ContasPagar.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { vencimentosColumns } from "@/components/financeiro/VencimentosColumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContaPagarModal } from "@/components/financeiro/ContaPagarModal";

const ContasPagar: React.FC = () => {
  const { contasPagar, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative">
      {/* CONTEÚDO COM BLUR */}
      <div className="p-4 space-y-4 blur-sm pointer-events-none select-none">
        <h1 className="text-2xl font-bold">Contas a Pagar</h1>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Input placeholder="Buscar por descrição..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
            <Button>Filtrar</Button>
            <div className="flex-grow" />
            <ContaPagarModal open={isModalOpen} onOpenChange={setIsModalOpen}>
              <Button onClick={() => setIsModalOpen(true)}>
                Nova Conta a Pagar
              </Button>
            </ContaPagarModal>
          </CardContent>
        </Card>

        <DataTable columns={vencimentosColumns} data={contasPagar} />
      </div>

      {/* OVERLAY */}
      <div
        className="absolute inset-0 flex items-center justify-center 
    bg-black/20 backdrop-blur-sm text-white text-xl font-semibold"
      >
        🚧 Funcionalidade ainda não implementada
      </div>
    </div>
  );
};

export default ContasPagar;
