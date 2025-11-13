// src/pages/Financeiro/ContasReceber.tsx
import React, { useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { recebimentosColumns } from "@/components/financeiro/RecebimentosColumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { ContaReceberModal } from "@/components/financeiro/ContaReceberModal";

const data = [
    { day: 1, value: 1200 },
    { day: 5, value: 2500 },
    { day: 10, value: 1800 },
    { day: 15, value: 3200 },
    { day: 20, value: 2800 },
    { day: 25, value: 4500 },
    { day: 30, value: 5000 },
];

const ContasReceber: React.FC = () => {
  const { contasReceber, loading } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Contas a Receber</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
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
                    <SelectItem value="pago">Recebido</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                </Select>
                <Button>Filtrar</Button>
                <div className="flex-grow" />
                <ContaReceberModal open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <Button onClick={() => setIsModalOpen(true)}>Nova Conta a Receber</Button>
                </ContaReceberModal>
                </CardContent>
            </Card>

            <div className="mt-4">
                <DataTable columns={recebimentosColumns} data={contasReceber} />
            </div>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Evolução dos Recebimentos</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip formatter={(value: number) =>
                                new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                }).format(value)
                            } />
                            <Area type="monotone" dataKey="value" stroke="#16a34a" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default ContasReceber;
