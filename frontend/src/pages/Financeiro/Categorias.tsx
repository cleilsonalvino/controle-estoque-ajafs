// src/pages/Financeiro/Categorias.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { categoriasFinanceirasColumns } from "@/components/financeiro/CategoriasFinanceirasColumns";
import { Button } from "@/components/ui/button";
import { CategoriaFinanceiraModal } from "@/components/financeiro/CategoriaFinanceiraModal";
import { AlertTriangle } from "lucide-react";

const EM_CONSTRUCAO = true;

const CategoriasFinanceiras: React.FC = () => {
  const { categorias, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* ========== CONTEÚDO PRINCIPAL COM BLUR ========== */}
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Categorias Financeiras</h1>

          <CategoriaFinanceiraModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          >
            <Button onClick={() => setIsModalOpen(true)}>
              Nova Categoria
            </Button>
          </CategoriaFinanceiraModal>
        </div>

        <DataTable
          columns={categoriasFinanceirasColumns}
          data={categorias}
        />
      </div>

      {/* ========== OVERLAY PREMIUM “EM CONSTRUÇÃO” ========== */}
      {EM_CONSTRUCAO && (
        <div
          className="
            absolute inset-0 z-50
            bg-white/60 backdrop-blur-md
            flex flex-col items-center justify-center
          "
        >
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">
            Em Construção
          </h2>

          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos finalizando esta área para entregar uma solução financeira completa.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoriasFinanceiras;
