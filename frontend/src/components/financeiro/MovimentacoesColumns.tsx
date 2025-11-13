// src/components/financeiro/MovimentacoesColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Movimentacao } from "@/types/financeiro";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const movimentacoesColumns: ColumnDef<Movimentacao>[] = [
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const isEntrada = tipo === "entrada";
      return (
        <div className="flex items-center">
          {isEntrada ? (
            <ArrowUp className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500" />
          )}
          <span className="ml-2">{isEntrada ? "Entrada" : "Saída"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "categoria",
    header: "Categoria",
  },
  {
    accessorKey: "valor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("valor"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
        const date = new Date(row.getValue("data"));
        const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date);
        return <span>{formattedDate}</span>;
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={cn({
            "bg-red-500": status === "cancelado",
            "bg-yellow-500": status === "pendente",
            "bg-green-500": status === "pago",
          })}
        >
          {status}
        </Badge>
      );
    },
  },
];
