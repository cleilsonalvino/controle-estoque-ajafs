import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useSales } from "../contexts/SalesContext";
import { useClientes } from "../contexts/ClienteContext";
import { useVendedores } from "../contexts/VendedorContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GerarRelatorioNF = () => {
  const { sales } = useSales();
  const { clientes } = useClientes();
  const { vendedores } = useVendedores();

  const [filters, setFilters] = useState({
    cliente: "",
    vendedor: "",
    status: "Concluída",
    formaPagamento: "",
    dataInicio: "",
    dataFim: "",
  });

  const handleGeneratePDF = () => {
    // Filtro das vendas com base nos critérios definidos
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.criadoEm);
      const startDate = filters.dataInicio ? new Date(filters.dataInicio) : null;
      const endDate = filters.dataFim ? new Date(filters.dataFim) : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const paymentCondition =
        filters.formaPagamento === "" ||
        sale.formaPagamento === filters.formaPagamento;

      return (
        (filters.cliente === "" || sale.cliente?.id === filters.cliente) &&
        (filters.vendedor === "" || sale.vendedor?.id === filters.vendedor) &&
        sale.status === filters.status &&
        paymentCondition &&
        (!startDate || saleDate >= startDate) &&
        (!endDate || saleDate <= endDate)
      );
    });

    // Gerar PDF
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Relatório de Notas Fiscais", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        ["Número", "Data", "Cliente", "Vendedor", "Forma de Pagamento", "Valor Total"],
      ],
      body: filteredSales.map((sale) => [
        sale.numero,
        new Date(sale.criadoEm).toLocaleDateString(),
        sale.cliente?.nome || "N/A",
        sale.vendedor?.nome || "N/A",
        sale.formaPagamento,
        `R$ ${Number(sale.total).toFixed(2)}`,
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 204, 0] }, // Amarelo (padrão AJAFS)
    });

    doc.save("relatorio_nf.pdf");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-yellow-500 hover:bg-yellow-600">
          Gerar relatório de NF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Relatório para Nota Fiscal</DialogTitle>
          <p className="text-sm text-gray-500">
            Selecione os filtros desejados e gere o relatório em PDF.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="cliente">Cliente</label>
              <select
                id="cliente"
                value={filters.cliente}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="vendedor">Vendedor</label>
              <select
                id="vendedor"
                value={filters.vendedor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Todos</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="Concluída">Concluída</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="formaPagamento">Forma de Pagamento</label>
              <select
                id="formaPagamento"
                value={filters.formaPagamento}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Todas</option>
                <option value="Pix">Pix</option>
                <option value="Transferência">Transferência</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="dataInicio">Data Início</label>
              <input
                type="date"
                id="dataInicio"
                value={filters.dataInicio}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dataFim">Data Fim</label>
              <input
                type="date"
                id="dataFim"
                value={filters.dataFim}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <Button onClick={handleGeneratePDF} className="w-full">
            Exportar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GerarRelatorioNF;
