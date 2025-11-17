// src/pages/Financeiro/Categorias.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { categoriasFinanceirasColumns } from "@/components/financeiro/CategoriasFinanceirasColumns";
import { Button } from "@/components/ui/button";
import { CategoriaFinanceiraModal } from "@/components/financeiro/CategoriaFinanceiraModal";

const CategoriasFinanceiras: React.FC = () => {
  const { categorias, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">

      {/* CONTEÚDO COM BLUR */}
      <div className="p-4 space-y-4 blur-sm pointer-events-none select-none">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Categorias Financeiras</h1>
          <CategoriaFinanceiraModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          >
            <Button onClick={() => setIsModalOpen(true)}>Nova Categoria</Button>
          </CategoriaFinanceiraModal>
        </div>

        <DataTable columns={categoriasFinanceirasColumns} data={categorias} />
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm text-white text-xl font-semibold">
        🚧 Funcionalidade ainda não implementada
      </div>
    </div>
  );
};

export default CategoriasFinanceiras;
