
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PosVenda, PosVendaStatus } from "@/types/pos-venda";
import { Link } from "react-router-dom";

const statusVariant: { [key in PosVendaStatus]: "secondary" | "default" | "outline" } = {
    pendente: "secondary",
    em_andamento: "default",
    finalizado: "outline",
};

const statusText = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    finalizado: "Finalizado",
}

const renderStars = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) return <span className="text-gray-400">N/A</span>;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Star
                key={i}
                className={`h-4 w-4 ${i <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
            />
        );
    }
    return <div className="flex items-center">{stars}</div>;
};


export const columns: ColumnDef<PosVenda>[] = [
  {
    accessorKey: "cliente.nome",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "venda.dataVenda",
    header: "Data da Venda",
    cell: ({ row }) => new Date(row.original.venda.dataVenda).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={statusVariant[status]}>{statusText[status]}</Badge>
    }
  },
  {
    accessorKey: "dataUltimoContato",
    header: "Último Contato",
    cell: ({ row }) => new Date(row.original.dataUltimoContato).toLocaleDateString(),
  },
  {
    accessorKey: "nivelSatisfacao",
    header: "Satisfação",
    cell: ({ row }) => renderStars(row.original.nivelSatisfacao),
  },
  {
    accessorKey: "responsavel.nome",
    header: "Responsável",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const posVenda = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link to={`/pos-venda/${posVenda.id}`}>Ver Detalhes</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Agendar Follow-up</DropdownMenuItem>
            <DropdownMenuItem>Finalizar Atendimento</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
