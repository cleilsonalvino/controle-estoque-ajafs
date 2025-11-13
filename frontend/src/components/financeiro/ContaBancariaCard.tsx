// src/components/financeiro/ContaBancariaCard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContaBancaria } from "@/types/financeiro";
import { Landmark, ArrowUp, ArrowDown, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { cn } from "@/lib/utils";
import { TransferenciaModal } from "./TransferenciaModal";

interface ContaBancariaCardProps {
  conta: ContaBancaria;
}

export const ContaBancariaCard = ({ conta }: ContaBancariaCardProps) => {
    const { user } = useAuth();
    const isNotAdmin = user?.papel?.toLowerCase() !== "administrador" && user?.email?.toLowerCase() !== "ajafs@admin.com";
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formattedSaldo = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(conta.saldo);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{conta.nome}</CardTitle>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", isNotAdmin && "blur-sm")}>{formattedSaldo}</div>
        <p className="text-xs text-muted-foreground">{conta.banco}</p>
        <div className="flex justify-between items-center mt-4">
            <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4" />
                <span className="text-xs ml-1">R$ 10.000,00</span>
            </div>
            <div className="flex items-center text-red-500">
                <ArrowDown className="h-4 w-4" />
                <span className="text-xs ml-1">R$ 5.000,00</span>
            </div>
        </div>
        <TransferenciaModal open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Button className="w-full mt-4" onClick={() => setIsModalOpen(true)}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferir
            </Button>
        </TransferenciaModal>
      </CardContent>
    </Card>
  );
};
