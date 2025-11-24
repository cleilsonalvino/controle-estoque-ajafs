// src/pages/Financeiro/ContasBancarias.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { ContaBancariaCard } from "@/components/financeiro/ContaBancariaCard";
import { Button } from "@/components/ui/button";
import { ContaBancariaModal } from "@/components/financeiro/ContaBancariaModal";
import { Banknote, AlertTriangle } from "lucide-react";

// 🔧 Controle global para ativar/desativar construção
const EM_CONSTRUCAO = true;

const ContasBancarias: React.FC = () => {
  const { contasBancarias } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* ===== CONTEÚDO REAL ===== */}
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Contas Bancárias</h1>

          <ContaBancariaModal open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button onClick={() => setIsModalOpen(true)}>
              Nova Conta Bancária
            </Button>
          </ContaBancariaModal>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contasBancarias.map((conta) => (
            <ContaBancariaCard key={conta.id} conta={conta} />
          ))}
        </div>
      </div>

      {/* ===== OVERLAY PREMIUM EM CONSTRUÇÃO ===== */}
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
            Estamos finalizando o módulo de contas bancárias para entregar uma
            experiência completa e intuitiva.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContasBancarias;
