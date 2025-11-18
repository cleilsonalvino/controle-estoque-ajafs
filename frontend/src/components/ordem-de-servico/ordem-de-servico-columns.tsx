
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { OrdemDeServico, StatusOrdemDeServico } from "@/types/ordem-de-servico";
import { Link } from "react-router-dom";

const statusVariant: {
  [key in StatusOrdemDeServico]: "secondary" | "default" | "outline" | "destructive";
} = {
  PENDENTE: "secondary",
  EM_ANDAMENTO: "default",
  CONCLUIDO: "outline",
  CANCELADO: "destructive",
};

const statusText = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const getColumns = (
  updateStatus: (id: string, status: StatusOrdemDeServico) => void
): ColumnDef<OrdemDeServico>[] => [
  {
    accessorKey: "servico.nome",
    header: "Serviço",
  },
  {
    accessorKey: "cliente.nome",
    header: "Cliente",
  },
  {
    accessorKey: "responsavel.nome",
    header: "Responsável",
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
    accessorKey: "criadoEm",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data de Criação
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => new Date(row.original.criadoEm).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ordem = row.original;

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
              <Link to={`/ordem-de-servico/${ordem.id}`}>Ver Detalhes</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateStatus(ordem.id, "EM_ANDAMENTO")}
              disabled={ordem.status === "EM_ANDAMENTO"}
            >
              Iniciar Serviço
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(ordem.id, "CONCLUIDO")}
              disabled={ordem.status === "CONCLUIDO"}
            >
              Concluir Serviço
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateStatus(ordem.id, "CANCELADO")}
              disabled={ordem.status === "CANCELADO"}
            >
              Cancelar Serviço
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
