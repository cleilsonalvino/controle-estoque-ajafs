// src/components/financeiro/CategoriasFinanceirasColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategoriaFinanceira } from "@/types/financeiro";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const categoriasFinanceirasColumns: ColumnDef<CategoriaFinanceira>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      return (
        <Badge
          className={cn({
            "bg-green-500": tipo === "entrada",
            "bg-red-500": tipo === "saida",
          })}
        >
          {tipo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "ativa" ? "default" : "destructive"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const categoria = row.original;
      // Here you can add edit and delete buttons
      return (
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          ...
        </Button>
      );
    },
  },
];
