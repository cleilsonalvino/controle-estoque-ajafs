// src/pages/Financeiro/Categorias.tsx
import React, { useEffect, useState } from "react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { DataTable } from "@/components/ui/data-table";
import { categoriasFinanceirasColumns } from "@/components/financeiro/CategoriasFinanceirasColumns";
import { Button } from "@/components/ui/button";
import { CategoriaFinanceiraModal } from "@/components/financeiro/CategoriaFinanceiraModal";
import { AlertTriangle } from "lucide-react";

const EM_CONSTRUCAO = false;

const CategoriasFinanceiras: React.FC = () => {
  const { categorias, loading, fetchCategorias } = useFinanceiro();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"TODAS" | "ENTRADA" | "SAIDA">(
    "TODAS"
  );

  useEffect(() => {
    const tipo = filtroTipo === "TODAS" ? undefined : filtroTipo;
    fetchCategorias(tipo);
  }, [filtroTipo, fetchCategorias]);

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div
        className={
          EM_CONSTRUCAO
            ? "p-4 space-y-4 blur-md pointer-events-none select-none"
            : "p-4 space-y-4"
        }
      >
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categorias Financeiras</h1>
            <p className="text-sm text-muted-foreground">
              Organize suas categorias de entrada e saída para relatórios mais
              completos e organizados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtros */}
            <div className="flex rounded-md overflow-hidden border bg-background">
              <Button
                variant={filtroTipo === "TODAS" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setFiltroTipo("TODAS")}
              >
                Todas
              </Button>
              <Button
                variant={filtroTipo === "ENTRADA" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setFiltroTipo("ENTRADA")}
              >
                Entradas
              </Button>
              <Button
                variant={filtroTipo === "SAIDA" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setFiltroTipo("SAIDA")}
              >
                Saídas
              </Button>
            </div>

            {/* Botão nova categoria */}
            <CategoriaFinanceiraModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
            >
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                Nova Categoria
              </Button>
            </CategoriaFinanceiraModal>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="border rounded-md p-6 text-sm text-muted-foreground">
            Carregando categorias financeiras...
          </div>
        ) : categorias.length === 0 ? (
          <div className="border rounded-md p-8 text-center text-muted-foreground text-sm">
            Nenhuma categoria encontrada{" "}
            {filtroTipo !== "TODAS" && (
              <span>para o filtro selecionado.</span>
            )}
          </div>
        ) : (
          <DataTable
            columns={categoriasFinanceirasColumns}
            data={categorias}
          />
        )}
      </div>

      {/* Overlay em construção */}
      {EM_CONSTRUCAO && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
          <AlertTriangle className="h-16 w-16 text-yellow-600 mb-4 animate-pulse" />

          <h2 className="text-3xl font-bold text-gray-800">
            Em construção
          </h2>

          <p className="mt-2 text-gray-700 text-sm max-w-xs text-center">
            Estamos finalizando esta área para entregar uma solução financeira completa.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoriasFinanceiras;
