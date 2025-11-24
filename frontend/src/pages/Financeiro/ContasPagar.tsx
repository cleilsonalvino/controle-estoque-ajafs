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
import { AlertTriangle } from "lucide-react";

// 🔧 Basta mudar para FALSE quando quiser liberar
const EM_CONSTRUCAO = true;

const ContasPagar: React.FC = () => {
  const { contasPagar } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* ==== CONTEÚDO REAL ==== */}
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        <h1 className="text-2xl font-bold">Contas a Pagar</h1>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap items-center gap-3">
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

      {/* ==== OVERLAY PREMIUM EM CONSTRUÇÃO ==== */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-50
            flex flex-col items-center justify-center
            bg-white/60 backdrop-blur-md
            animate-fadeIn
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">
            Em Construção
          </h2>

          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos preparando o módulo de contas a pagar para oferecer uma
            experiência completa e moderna.
          </p>
        </div>
      )}

    </div>
  );
};

export default ContasPagar;
