// src/components/tables/product-columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Produto } from "@/contexts/ProdutoContext";
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

// Tipagem das ações
export type ProductActions = {
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onView: (produto: Produto) => void;
};

export const getProductColumns = (
  actions: ProductActions
): ColumnDef<Produto>[] => [
  {
    accessorKey: "nome",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 text-left font-semibold hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 dark:text-gray-200">
        {row.original.nome}
      </span>
    ),
  },

  {
    accessorKey: "marca.nome",
    header: "Marca",
    cell: ({ row }) => {
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.marca?.nome || "Sem marca"}
        </span>
      );
    },
  },

  {
    accessorKey: "codigoBarras",
    header: "Código de barras",
    cell: ({ row }) =>
      <span className="text-gray-700 dark:text-gray-300">
        {row.original.codigoBarras || "Sem código de barras"}
      </span>
  },

  {
    accessorKey: "categoria.nome",
    header: "Categoria",
    cell: ({ row }) => {
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.categoria?.nome || "Sem categoria"}
        </span>
      );
    },
  },

  {
    accessorKey: "quantidadeTotal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 text-left font-semibold hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estoque
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const qtd = row.original.quantidadeTotal || 0;
      const min = row.original.estoqueMinimo || 0;
      const isBaixo = Number(qtd) <= Number(min);

      return (
        <span
          className={
            isBaixo
              ? "text-yellow-600 font-semibold dark:text-yellow-400"
              : "text-gray-800 dark:text-gray-200"
          }
        >
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
      return (
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      );
    },
  },

  {
    id: "actions",
    header: "Ações",
    enableHiding: false,
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
              font-family: sans-serif;
            }
            svg {
              max-width: 100%;
              max-height: 80%;
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
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 shadow-md rounded-md"
            >
              <DropdownMenuLabel>Ações</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => actions.onView(produto)}
                className="cursor-pointer"
              >
                Ver Detalhes
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => actions.onEdit(produto)}
                className="cursor-pointer"
              >
                Editar
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-green-600 dark:text-green-400 cursor-pointer"
                onClick={() => handlePrintBarcode(produto.codigoBarras)}
              >
                Imprimir código de barras
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 cursor-pointer"
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
        </div>
      );
    },
  },
];
