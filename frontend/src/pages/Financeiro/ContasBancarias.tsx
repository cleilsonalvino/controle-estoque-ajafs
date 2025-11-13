// src/pages/Financeiro/ContasBancarias.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { ContaBancariaCard } from "@/components/financeiro/ContaBancariaCard";
import { Button } from "@/components/ui/button";
import { ContaBancariaModal } from "@/components/financeiro/ContaBancariaModal";

const ContasBancarias: React.FC = () => {
  const { contasBancarias, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Contas Bancárias</h1>
            <ContaBancariaModal open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Button onClick={() => setIsModalOpen(true)}>Nova Conta Bancária</Button>
            </ContaBancariaModal>
        </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contasBancarias.map((conta) => (
          <ContaBancariaCard key={conta.id} conta={conta} />
        ))}
      </div>
    </div>
  );
};

export default ContasBancarias;
