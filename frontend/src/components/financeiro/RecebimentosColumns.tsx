// src/components/financeiro/RecebimentosColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ContaReceber } from "@/types/financeiro";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const recebimentosColumns: ColumnDef<ContaReceber>[] = [
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
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
    accessorKey: "vencimento",
    header: "Vencimento",
    cell: ({ row }) => {
        const date = new Date(row.getValue("vencimento"));
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
            "bg-red-500": status === "atrasado",
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
