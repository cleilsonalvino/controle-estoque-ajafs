// src/components/tables/product-columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Produto } from "@/contexts/ProdutoContext"; // Ajuste o import
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

// Tipo para as ações (para passar as funções de edit/delete)
export type ProductActions = {
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onView: (produto: Produto) => void;
};

// Esta função gera as colunas, recebendo as ações como parâmetro
export const getProductColumns = (
  actions: ProductActions
): ColumnDef<Produto>[] => [
  {
    accessorKey: "nome",
    // ✅ AQUI ESTÁ A "CETINHA" (SETINHA)
    // Criamos um header customizado com um botão
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "categoria.nome",
    header: "Categoria",
    cell: ({ row }) => {
      return row.original.categoria?.nome || "Sem categoria";
    },
  },
  {
    accessorKey: "quantidadeTotal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estoque
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    // Você pode formatar a célula
    cell: ({ row }) => {
      const qtd = row.original.quantidadeTotal || 0;
      const min = row.original.estoqueMinimo || 0;
      const isBaixo = Number(qtd) <= Number(min);

      return (
        <span className={isBaixo ? "text-yellow-600 font-bold" : ""}>
          {qtd}
        </span>
      );
    },
  },
  {
    accessorKey: "precoVenda",
    header: "Preço Venda",
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue("precoVenda") || "0");
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const produto = row.original;

      const handlePrintBarcode = (codigo: string) => {
        if (!codigo) {
          alert("O produto ainda não tem código de barras!");
          return;
        }

        const printWindow = window.open("", "_blank", "width=600,height=300");
        if (!printWindow) return;

        const doc = printWindow.document;
        doc.head.innerHTML = `
    <title>Código de Barras</title>
    <style>
      body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      svg {
        max-width: 90%;
        max-height: 90%;
      }
      @media print {
        body { margin: 0; }
        svg { page-break-inside: avoid; }
      }
    </style>
  `;

        const container = doc.createElement("div");
        const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "barcode";
        container.appendChild(svg);
        doc.body.appendChild(container);

        const script = doc.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
        script.onload = () => {
          // @ts-ignore
          printWindow.JsBarcode("#barcode", codigo, {
            format: "EAN13",
            displayValue: true,
          });
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        };
        doc.body.appendChild(script);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => actions.onView(produto)}>
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onEdit(produto)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-green-500"
              onClick={() => {
                handlePrintBarcode(produto.codigoBarras);
              }}
            >
              Imprimir código de barras
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => {
                if (confirm("Tem certeza que deseja excluir?")) {
                  actions.onDelete(produto.id);
                }
              }}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
