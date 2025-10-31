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
    // Filtra as vendas conforme os filtros definidos
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.criadoEm);
      const startDate = filters.dataInicio
        ? new Date(filters.dataInicio)
        : null;
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

    // Inicia o PDF no formato paisagem (melhor para tabelas grandes)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();

    // ====== CABEÇALHO ======
    doc.setFillColor(255, 204, 0); // Amarelo AJAFS
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Relatório de Notas Fiscais", pageWidth / 2, 15, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString(
        "pt-BR"
      )} às ${new Date().toLocaleTimeString("pt-BR")}`,
      pageWidth - 65,
      20
    );

    // ====== TABELA ======
    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Número",
          "Produto(s)",
          "Data",
          "Cliente",
          "CPF",
          "Vendedor",
          "Forma de Pagamento",
          "Valor Total (R$)",
        ],
      ],
      body: filteredSales.map((sale) => [
        sale.numero,
        sale.itens?.map((item) => item.produto?.nome).join(", ") || "—",
        new Date(sale.criadoEm).toLocaleDateString("pt-BR"),
        sale.cliente?.nome || "N/A",
        sale.cliente?.cpf || "N/A",
        sale.vendedor?.nome || "N/A",
        sale.formaPagamento || "—",
        Number(sale.total || 0).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        }),
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: "middle",
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 204, 0],
        textColor: [40, 40, 40],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [60, 60, 60],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        7: { halign: "right" },
      },
      margin: { top: 30, left: 10, right: 10 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.pages.length;
        const currentPage = (doc.internal as any).getCurrentPageInfo().pageNumber; 
        doc.setFontSize(9);
        doc.setTextColor(130);
        doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - 25, 200);
        doc.text("AJAFS - Relatórios Empresariais", 10, 200);
      },
    });

    // ====== RESUMO FINAL ======
    const totalGeral = filteredSales.reduce(
      (acc, sale) => acc + Number(sale.total || 0),
      0
    );
    const posY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumo Geral", 14, posY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Total de vendas incluídas: ${filteredSales.length}`,
      14,
      posY + 6
    );
    doc.text(
      `Valor total acumulado: R$ ${totalGeral.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      14,
      posY + 12
    );

    // ====== MARCA D'ÁGUA (opcional) ======
    doc.setFontSize(40);
    doc.setTextColor(240, 240, 240);
    doc.text("AJAFS", pageWidth / 2, 150, { align: "center", angle: 45 });

    // ====== SALVAR ======
    doc.save(`relatorio_nf_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
