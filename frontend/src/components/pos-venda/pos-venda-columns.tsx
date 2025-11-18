
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

const statusVariant: {
  [key in PosVendaStatus]: "secondary" | "default" | "outline";
} = {
  PENDENTE: "secondary",
  EM_ANDAMENTO: "default",
  FINALIZADO: "outline",
};

const statusText = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  FINALIZADO: "Finalizado",
};

const renderStars = (rating: number | null | undefined) => {
  if (rating === null || rating === undefined)
    return <span className="text-gray-400">N/A</span>;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-4 w-4 ${
          i <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    );
  }
  return <div className="flex items-center">{stars}</div>;
};

export const getColumns = (
  finalizarAtendimento: (id: string) => void,
  agendarFollowUp: (id: string) => void
): ColumnDef<PosVenda>[] => [
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
    accessorKey: "venda.criadoEm",
    header: "Data da Venda",
    cell: ({ row }) =>
      row.original.venda?.criadoEm
        ? new Date(row.original.venda.criadoEm).toLocaleDateString()
        : "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge variant={statusVariant[status]}>{statusText[status]}</Badge>;
    },
  },
  {
    accessorKey: "atualizadoEm",
    header: "Último Contato",
    cell: ({ row }) =>
      new Date(row.original.atualizadoEm).toLocaleDateString(),
  },
  {
    accessorKey: "satisfacao",
    header: "Satisfação",
    cell: ({ row }) => renderStars(row.original.satisfacao),
  },
  {
    accessorKey: "usuario.nome",
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
            <DropdownMenuItem onClick={() => agendarFollowUp(posVenda.id)}>
              Agendar Follow-up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => finalizarAtendimento(posVenda.id)}>
              Finalizar Atendimento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
