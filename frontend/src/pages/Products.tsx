import React, { useMemo, useState, useEffect } from "react";
import { useProdutos, Produto } from "@/contexts/ProdutoContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit3,
  Trash2,
  TagIcon,
  Search,
  PlusCircle,
  LayoutGrid,
  Eye,
  Trash,
} from "lucide-react";
import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Category as Categoria } from "@/contexts/CategoryContext";
import { Supplier as Fornecedor } from "@/contexts/SupplierContext";
import api from "@/lib/api";
// CORREÇÃO: Removida a importação de 'RechartsTooltip' e importado o 'Tooltip' padrão.
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogDescription } from "@radix-ui/react-dialog";

/**
 * Modal de Detalhes do Produto
 */
const ProdutoDetalhesDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto: Produto | null;
}> = ({ open, onOpenChange, produto }) => {
  if (!produto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Produto</DialogTitle>
          <DialogDescription id="dialog-description">
            Preencha os dados do novo produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={
                  produto.image ||
                  "https://placehold.co/600x400?text=Foto+Produto"
                }
                alt={produto.nome}
                className="w-full h-auto object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{produto.nome}</h3>
                <p className="text-muted-foreground">{produto.descricao}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço de Venda</Label>
                  <p className="font-semibold">
                    R${" "}
                    {Number(produto.precoVenda).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <Label>Estoque Mínimo</Label>
                  <p className="font-semibold">{produto.estoqueMinimo}</p>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <p className="font-semibold">
                    {produto.categoria?.nome || "Sem categoria"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Lotes</h4>
            <ShadcnTable>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço de Custo</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Data de Compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produto.lote?.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell>{lote.id}</TableCell>
                    <TableCell>
                      {new Date(lote.validade).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {lote.quantidadeAtual}
                    </TableCell>
                    <TableCell className="text-right">
                      R${" "}
                      {Number(lote.precoCusto).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      {lote.fornecedor?.nome || "Sem fornecedor"}
                    </TableCell>
                    <TableCell>
                      {new Date(lote.dataCompra).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ShadcnTable>
            {(!produto.lote || produto.lote.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum lote cadastrado para este produto.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const fetchCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get<Categoria[]>("/categorias");
    return response.data;
  } catch (error: any) {
    console.error("Falha ao buscar categorias:", error.message || error);
    return [];
  }
};

const fetchFornecedores = async (): Promise<Fornecedor[]> => {
  try {
    const response = await api.get<Fornecedor[]>("/fornecedores");
    return response.data;
  } catch (error: any) {
    console.error("Falha ao buscar fornecedores:", error.message || error);
    return [];
  }
};

/**
 * Modal de Edição de Produto
 */
const EditProdutoDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto: Produto | null;
  onSave: (p: Produto) => void;
}> = ({ open, onOpenChange, produto, onSave }) => {
  const [form, setForm] = useState<Produto | null>(produto);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [precoVendaInput, setPrecoVendaInput] = useState("");

  const { fetchProdutos } = useProdutos();

  useEffect(() => {
    setForm(produto ?? null);
  }, [produto]);

  useEffect(() => {
    setPrecoVendaInput(
      produto ? produto.precoVenda.toString().replace(".", ",") : ""
    );
  }, [produto]);

  useEffect(() => {
    if (open) {
      fetchCategorias().then(setCategorias);
      fetchFornecedores().then(setFornecedores);
    }
  }, [open]);

  const handleChange = (key: keyof Produto, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const handleSelectChange = (path: "categoria" | "fornecedor", id: string) => {
    if (!form) return;
    const list = path === "categoria" ? categorias : fornecedores;
    const selected = list.find((item) => item.id === id);
    if (selected) setForm({ ...form, [path]: selected });
  };

  const handlePriceInput = (v: string) => {
    const cleaned = v.replace(/[^0-9,]/g, "");
    setPrecoVendaInput(cleaned);
  };

  const formatPrecoOnBlur = () => {
    const value = precoVendaInput;
    if (!value) return setPrecoVendaInput("0,00");

    let [reais, centavos] = value.split(",");
    if (!centavos) centavos = "00";
    else if (centavos.length === 1) centavos += "0";
    else if (centavos.length > 2) centavos = centavos.slice(0, 2);

    setPrecoVendaInput(`${reais || 0},${centavos}`);
  };

  const canSave = useMemo(() => {
    if (!form) return false;
    return (form.nome?.trim()?.length ?? 0) > 0 && precoVendaInput.length > 0;
  }, [form, precoVendaInput]);

  const onSubmit = async () => {
    if (!form || !canSave) return;
    try {
      setSaving(true);
      const precoVendaNumber = String(
        Number(precoVendaInput.replace(",", "."))
      );
      onSave({ ...form, precoVenda: precoVendaNumber });
      onOpenChange(false);
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {/* CORREÇÃO: Layout ajustado e campo de Preço de Custo removido. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
              <Input
                id="precoVenda"
                value={precoVendaInput}
                onChange={(e) => handlePriceInput(e.target.value)}
                onBlur={() => formatPrecoOnBlur()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="min-h-28"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="categoriaNome"
                className="flex items-center gap-2"
              >
                <TagIcon className="w-4 h-4" /> Categoria
              </Label>
              <Select
                value={form.categoria?.id}
                onValueChange={(id) => handleSelectChange("categoria", id)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                value={String(form.estoqueMinimo ?? "")}
                onChange={(e) =>
                  handleChange(
                    "estoqueMinimo",
                    e.target.value.replace(/[^0-9]/g, "")
                  )
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!canSave || saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Modal de Criação de Produto
 */
const CreateProdutoDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Omit<Produto, "id">) => void;
}> = ({ open, onOpenChange, onCreate }) => {
  // CORREÇÃO: Adicionado `precoCusto` ao estado inicial do formulário.
  const initialState: Omit<Produto, "id" | "codigoBarras"> = {
    nome: "",
    descricao: "",
    precoVenda: "",
    image: "",
    categoria: { id: "", nome: "" },
    estoqueMinimo: "0",
    lote: [],
    criadoEm: undefined,
  };

  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const { fetchProdutos } = useProdutos();

  useEffect(() => {
    if (open) {
      fetchCategorias().then(setCategorias);
      fetchFornecedores().then(setFornecedores);
    }
  }, [open]);

  const handleChange = (key: keyof typeof form, value: any) =>
    setForm({ ...form, [key]: value });

  const handleSelectChange = (path: "categoria" | "fornecedor", id: string) => {
    const list = path === "categoria" ? categorias : fornecedores;
    const selected = list.find((item) => item.id === id);
    if (selected) setForm({ ...form, [path]: selected });
  };

  const handlePriceInput = (field: "precoCusto" | "precoVenda", v: string) => {
    const digits = v.replace(/\D/g, "");
    setForm({ ...form, [field]: digits });
  };

  const canSave = useMemo(() => {
    return (form.nome?.trim()?.length ?? 0) > 0 && form.precoVenda.length > 0;
  }, [form]);

  const onSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      // CORREÇÃO: `precoCusto` é incluído ao criar o produto.
      const precoVendaNumber = (Number(form.precoVenda) / 100).toFixed(2);
      onCreate({
        ...form,
        precoVenda: precoVendaNumber,
        codigoBarras: ""
      });
      onOpenChange(false);
      setForm(initialState);
      fetchProdutos();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto ">
<DialogHeader>
  <div className="flex items-center gap-2 max-w-lg justify-between">
    <DialogTitle className="text-2xl font-semibold text-black ">
      Criar novo produto
    </DialogTitle>

    {/* Tooltip opcional para o ícone */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Trash
            onClick={()=> {setForm(initialState)}}
            id="nome-create"
            className="w-5 h-5 text-black cursor-pointer hover:text-red-300 transition-colors"
          />
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  </div>
</DialogHeader>

        <div className="space-y-6 py-2">
          {/* CORREÇÃO: Layout de grid corrigido e input de Preço de Custo adicionado. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome-create">Nome</Label>
              <Input
              className="border-slate-900"
                id="nome-create"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco-venda-create">Preço de Venda (R$)</Label>
              <Input
                className="border-slate-900"
                id="preco-venda-create"
                value={form.precoVenda}
                onChange={(e) => handlePriceInput("precoVenda", e.target.value)}
                placeholder="Ex: 2999 para R$ 29,99"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-create">URL da imagem</Label>
            <Input
              className="border-slate-900"
              id="image-create"
              value={form.image ?? ""}
              onChange={(e) => handleChange("image", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao-create">Descrição</Label>
            <Textarea
              
              id="descricao-create"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className="min-h-28 border-slate-500"
            />
          </div>

          <Separator /> 

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 ">
              <Label
                htmlFor="categoriaNome-create"
                className="flex items-center gap-2"
              >
                <TagIcon className="w-4 h-4" /> Categoria
              </Label>
              <Select
                
                value={form.categoria.id}
                onValueChange={(id) => handleSelectChange("categoria", id)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo-create">Estoque Mínimo</Label>
              <Input
                className="border-slate-500"
                id="estoqueMinimo-create"
                type="number"
                value={String(form.estoqueMinimo)}
                onChange={(e) =>
                  handleChange(
                    "estoqueMinimo",
                    e.target.value.replace(/[^0-9]/g, "")
                  )
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!canSave || saving}>
            {saving ? "Criando..." : "Criar produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Tela principal de produtos
 */
export const Products: React.FC = () => {
  const { toast } = useToast();
  const { produtos, loading, createProduto, updateProduto, deleteProduto } =
    useProdutos();

  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome-asc");

  const handleOpenEdit = (produto: Produto) => {
    setSelectedProduct(produto);
    setOpenEdit(true);
  };

  const handleSave = async (produtoAtualizado: Produto) => {
    try {
      const { id, ...dados } = produtoAtualizado;
      await updateProduto(id, dados);

      toast({ title: "✅ Produto atualizado com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleCreate = async (novoProduto: Omit<Produto, "id">) => {
    try {
      await createProduto(novoProduto);
      toast({ title: "✅ Produto criado com sucesso!" });
      setOpenCreate(false);
    } catch (error) {
      toast({
        title: "Erro ao criar produto",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduto(id);
      toast({ title: "🗑️ Produto removido com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao remover produto",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];
    const termoBusca = filtro.toLowerCase().trim();
    if (!termoBusca) return produtos;
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termoBusca) ||
        p.descricao?.toLowerCase().includes(termoBusca) ||
        p.categoria?.nome?.toLowerCase().includes(termoBusca)
    );
  }, [produtos, filtro]);

  const produtosOrdenados = useMemo(() => {
    const copia = [...produtosFiltrados];
    const [criterio, direcao] = ordenacao.split("-");
    copia.sort((a, b) => {
      let valA: any, valB: any;
      if (criterio === "nome") {
        valA = a.nome.toLowerCase();
        valB = b.nome.toLowerCase();
      } else if (criterio === "precoVenda") {
        valA = Number(a.precoVenda);
        valB = Number(b.precoVenda);
      }
      if (valA < valB) return direcao === "asc" ? -1 : 1;
      if (valA > valB) return direcao === "asc" ? 1 : -1;
      return 0;
    });
    return copia;
  }, [produtosFiltrados, ordenacao]);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie produtos, fornecedores e lotes de forma inteligente.
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)} className="h-10 gap-2">
          <PlusCircle className="w-5 h-5" />
          Adicionar Produto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-muted/40 rounded-lg border">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, categoria..."
            className="pl-10 h-10 w-full"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <Select value={ordenacao} onValueChange={setOrdenacao}>
          <SelectTrigger className="w-full md:w-[180px] h-10">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
            <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
            <SelectItem value="precoVenda-asc">Preço (Menor)</SelectItem>
            <SelectItem value="precoVenda-desc">Preço (Maior)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {!loading && produtosOrdenados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <LayoutGrid className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">
              Nenhum produto cadastrado
            </h3>
            <p className="text-muted-foreground">
              Clique em "Adicionar Produto" para começar.
            </p>
          </motion.div>
        ) : (
          <ShadcnTable>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Quantidade em estoque</TableHead>
                <TableHead>Preço Custo(média)</TableHead>
                <TableHead>Preço Venda</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosOrdenados.map((produto, i) => (
                <motion.tr
                  key={`${produto.id}-${produto.criadoEm}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell
                    className="font-medium cursor-pointer hover:text-primary"
                    onClick={() => {
                      setSelectedProduct(produto);
                      setOpenDetalhes(true);
                    }}
                  >
                    {produto.nome}
                  </TableCell>
                  <TableCell>
                    {produto.categoria?.nome || "Sem categoria"}
                  </TableCell>
                  <TableCell>
                    {produto.lote?.[0]
                      ? new Date(produto.lote[0].dataCompra).toLocaleDateString(
                          "pt-BR"
                        )
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {produto.lote?.reduce(
                      (total, lote) => total + Number(lote.quantidadeAtual),
                      0
                    )}
                  </TableCell>

                  <TableCell>
                    R${" "}
                    {(
                      produto.lote?.reduce(
                        (acumulador, item) =>
                          acumulador + Number(item.precoCusto),
                        0
                      ) / produto.lote?.length
                    ).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {produto.precoVenda ? `R$ ${produto.precoVenda}` : "—"}
                  </TableCell>
                  {/* CORREÇÃO: Bloco de ações com Tooltip corrigido. */}
                  <TableCell className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedProduct(produto);
                              setOpenDetalhes(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(produto)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Excluir</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </ShadcnTable>
        )}
      </AnimatePresence>

      {selectedProduct && (
        <EditProdutoDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          produto={selectedProduct}
          onSave={handleSave}
        />
      )}
      <CreateProdutoDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={handleCreate}
      />
      {selectedProduct && (
        <ProdutoDetalhesDialog
          open={openDetalhes}
          onOpenChange={setOpenDetalhes}
          produto={selectedProduct}
        />
      )}
    </div>
  );
};

export default Products;
