// src/pages/Financeiro/ContasBancarias.tsx
import React, { useEffect, useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { ContaBancariaCard } from "@/components/financeiro/ContaBancariaCard";
import { Button } from "@/components/ui/button";
import { ContaBancariaModal } from "@/components/financeiro/ContaBancariaModal";
import { AlertTriangle, Banknote } from "lucide-react";

const EM_CONSTRUCAO = false;

const ContasBancarias: React.FC = () => {
  const { contasBancarias, fetchContasBancarias, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

useEffect(() => {
  fetchContasBancarias();
}, []);
  

  

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      {/* ---- CONTEÚDO PRINCIPAL ---- */}
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Contas Bancárias</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas contas bancárias para controlar melhor o fluxo financeiro.
            </p>
          </div>

          <ContaBancariaModal open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button onClick={() => setIsModalOpen(true)}>
              Nova Conta Bancária
            </Button>
          </ContaBancariaModal>
        </div>

        {/* Lista de contas */}
        {loading ? (
          <div className="border rounded-md p-6 text-sm text-muted-foreground">
            Carregando contas bancárias...
          </div>
        ) : (contasBancarias?.length ?? 0) === 0 ? (
          <div className="border rounded-md p-10 text-center text-muted-foreground text-sm">
            Nenhuma conta bancária cadastrada ainda.
            <br />
            Clique no botão acima para adicionar sua primeira conta.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(contasBancarias ?? [] ).map((conta) => (
              <ContaBancariaCard key={conta.id} conta={conta} />
            ))}
          </div>
        )}
      </div>

      {/* ---- OVERLAY DE CONSTRUÇÃO ---- */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-50
            flex flex-col items-center justify-center
            bg-white/60 backdrop-blur-md
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">
            Em Construção
          </h2>

          <p className="mt-3 text-gray-700 text-sm max-w-xs text-center">
            Estamos finalizando o módulo de contas bancárias para entregar uma
            experiência moderna, rápida e totalmente integrada ao seu financeiro.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContasBancarias;
