// src/pages/Financeiro/Movimentacoes.tsx

import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { movimentacoesColumns } from "@/components/financeiro/MovimentacoesColumns";
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
import { MovimentacaoModal } from "@/components/financeiro/MovimentacaoModal";
import { AlertTriangle } from "lucide-react";

// 🔧 Controle da feature (quando quiser liberar, troque para false)
const EM_CONSTRUCAO = true;

const Movimentacoes: React.FC = () => {
  const { movimentacoes, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* === CONTEÚDO REAL (escondido + blur quando em construção) === */}
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        <h1 className="text-2xl font-bold">Movimentações Financeiras</h1>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>

          <CardContent className="flex items-center gap-2 flex-wrap">

            <Input
              placeholder="Buscar por descrição..."
              className="max-w-sm"
            />

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
              <Button onClick={() => setIsModalOpen(true)}>
                Criar nova movimentação
              </Button>
            </MovimentacaoModal>
          </CardContent>
        </Card>

        <DataTable columns={movimentacoesColumns} data={movimentacoes} />
      </div>

      {/* === OVERLAY EM CONSTRUÇÃO — VISUAL PREMIUM === */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-40
            flex flex-col items-center justify-center
            backdrop-blur-md bg-white/60
            animate-fadeIn
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">
            Em Construção
          </h2>

          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos finalizando o módulo de movimentações financeiras para
            garantir a melhor experiência de gestão para sua empresa.
          </p>
        </div>
      )}
    </div>
  );
};

export default Movimentacoes;
