import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Produto, useProdutos } from "@/contexts/ProdutoContext";
import { api } from "@/lib/api";

interface ProdutoDetalhesDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto: Produto | null;
}

export const ProdutoDetalhesDialog: React.FC<ProdutoDetalhesDialogProps> = ({
  open,
  onOpenChange,
  produto,
}) => {
  const { getProdutoById } = useProdutos();
  const [produtoDetalhado, setProdutoDetalhado] = useState<Produto | null>(
    produto
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && produto?.id) {
      setIsLoading(true);
      getProdutoById(produto.id)
        .then((dadosCompletos) => {
          if (dadosCompletos) {
            setProdutoDetalhado(dadosCompletos);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar detalhes:", err);
          setProdutoDetalhado(produto);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setProdutoDetalhado(produto);
    }
  }, [open, produto, getProdutoById]);

  if (!produtoDetalhado) return null;

  async function handledeleteLote(loteId: string, produtoId: string) {
    if (!produtoId) return;
    try {
      await api.delete(`/estoque/deletar-lote/${loteId}/produto/${produtoId}`);
      alert("Lote deletado com sucesso!");

      const dadosAtualizados = await getProdutoById(produtoId);
      if (dadosAtualizados) setProdutoDetalhado(dadosAtualizados);
    } catch (err) {
      console.error("Erro ao deletar lote:", err);
      alert("Não foi possível deletar o lote.");
    }
  }

  const getImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/600x400?text=Sem+Imagem";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Detalhes do Produto
          </DialogTitle>
          <DialogDescription id="dialog-description">
            Visualizar informações completas do produto
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <img
                  src={
                    getImageUrl(produtoDetalhado.urlImage) ||
                    "https://placehold.co/600x400?text=Foto+Produto"
                  }
                  alt={produtoDetalhado.nome}
                  className="w-full h-auto max-h-72 object-cover rounded-lg shadow-md"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {produtoDetalhado.nome} - {produtoDetalhado.marca?.nome || "SEM MARCA"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {produtoDetalhado.descricao || "Sem descrição definida."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Preço de Venda
                    </Label>
                    <p className="font-semibold text-base">
                      R{"$ "}
                      {Number(produtoDetalhado.precoVenda).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Estoque mínimo
                    </Label>
                    <p className="font-semibold text-base">
                      {produtoDetalhado.estoqueMinimo}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Categoria
                    </Label>
                    <p className="font-semibold text-base">
                      {produtoDetalhado.categoria?.nome || "Sem categoria"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Custo médio
                    </Label>
                    <p className="font-semibold text-base">
                      {produtoDetalhado.custoMedio
                        ? Number(produtoDetalhado.custoMedio).toLocaleString(
                            "pt-BR",
                            {
                              style: "currency",
                              currency: "BRL",
                            }
                          )
                        : "Calculando..."}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Código de barras
                    </Label>
                    <p className="font-mono text-xs bg-slate-100 p-1 rounded inline-flex mt-1">
                      {produtoDetalhado.codigoBarras || "N A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <h4 className="text-base sm:text-lg font-semibold">
                  Lotes em estoque
                </h4>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Total itens:{" "}
                  {produtoDetalhado.lote?.reduce(
                    (acc, l) => acc + Number(l.quantidadeAtual),
                    0
                  ) || 0}
                </span>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <ShadcnTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Lote ID
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Validade
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap">
                        Quantidade
                      </TableHead>
                      <TableHead className="text-right whitespace-nowrap">
                        Custo unidade
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Fornecedor
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Compra
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtoDetalhado.lote?.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {lote.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {lote.validade
                            ? new Date(lote.validade).toLocaleDateString(
                                "pt-BR"
                              )
                            : "N A"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {lote.quantidadeAtual}
                        </TableCell>
                        <TableCell className="text-right">
                          R{"$ "}
                          {Number(lote.precoCusto).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          {lote.fornecedor?.nome || " "}
                        </TableCell>
                        <TableCell>
                          {new Date(lote.dataCompra).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (
                                confirm(
                                  "Deseja realmente deletar este lote Esta ação impacta o estoque do produto."
                                )
                              ) {
                                handledeleteLote(lote.id, produtoDetalhado.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ShadcnTable>
              </div>

              {(!produtoDetalhado.lote ||
                produtoDetalhado.lote.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-slate-50 rounded-b-md">
                  <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm text-center px-4">
                    Nenhum lote ativo encontrado para este produto.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
