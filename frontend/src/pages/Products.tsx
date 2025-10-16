import React, { useMemo, useState, useEffect } from "react";
import { useProdutos, Produto } from "@/contexts/ProdutoContext";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
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
  Package,
  DollarSign,
  Boxes,
  Search,
  PlusCircle,
  LayoutGrid,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";

// Tipagem para os dados da API
type Categoria = {
  id: string;
  nome: string;
};

type Fornecedor = {
  id: string;
  nome: string;
};

// ALTERADO: As funções agora fazem chamadas de API reais
const fetchCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await api.get<Categoria[]>("/categorias");
    return response.data; // Axios já devolve os dados aqui
  } catch (error: any) {
    console.error("Falha ao buscar categorias:", error.message || error);
    return []; // Retorna array vazio em caso de erro
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
  const [precoInput, setPrecoInput] = useState("");

  const { fetchProdutos } = useProdutos();

  // Atualiza form quando troca de produto
  useEffect(() => {
    setForm(produto ?? null);
  }, [produto]);

  // Atualiza input de preço quando muda o produto
  useEffect(() => {
    setPrecoInput(produto ? produto.preco.toString().replace(".", ",") : "");
  }, [produto]);

  // Busca categorias e fornecedores ao abrir
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

  // ===== Preço =====
  const handlePriceInput = (v: string) => {
    const cleaned = v.replace(/[^0-9,]/g, ""); // só números e vírgula
    setPrecoInput(cleaned);
  };

  const formatPrecoOnBlur = () => {
    if (!precoInput) return setPrecoInput("0,00");

    let [reais, centavos] = precoInput.split(",");
    if (!centavos) centavos = "00";
    else if (centavos.length === 1) centavos += "0";
    else if (centavos.length > 2) centavos = centavos.slice(0, 2);

    setPrecoInput(`${reais},${centavos}`);
  };

  const canSave = useMemo(() => {
    if (!form) return false;
    return (form.nome?.trim()?.length ?? 0) > 0 && precoInput.length > 0;
  }, [form, precoInput]);

  const onSubmit = async () => {
    if (!form || !canSave) return;
    try {
      setSaving(true);
      // Converte para decimal antes de salvar
      const precoNumber = String(Number(precoInput.replace(",", ".")));
      onSave({ ...form, preco: precoNumber });
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
          {/* Nome e Preço */}
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
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                value={precoInput}
                onChange={(e) => handlePriceInput(e.target.value)}
                onBlur={formatPrecoOnBlur}
              />
            </div>
          </div>

          {/* Descrição */}
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

          {/* Categoria e Fornecedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoriaNome" className="flex items-center gap-2">
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

            <div className="space-y-2">
              <Label htmlFor="fornecedorNome" className="flex items-center gap-2">
                <Package className="w-4 h-4" /> Fornecedor
              </Label>
              <Select
                value={form.fornecedor?.id}
                onValueChange={(id) => handleSelectChange("fornecedor", id)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((forn) => (
                    <SelectItem key={forn.id} value={forn.id}>
                      {forn.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoqueAtual" className="flex items-center gap-2">
                <Boxes className="w-4 h-4" /> Estoque Atual
              </Label>
              <Input
                id="estoqueAtual"
                value={String(form.estoqueAtual ?? "")}
                onChange={(e) =>
                  handleChange("estoqueAtual", e.target.value.replace(/[^0-9-]/g, ""))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                value={String(form.estoqueMinimo ?? "")}
                onChange={(e) =>
                  handleChange("estoqueMinimo", e.target.value.replace(/[^0-9-]/g, ""))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
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
  const [form, setForm] = useState<Omit<Produto, "id">>({
    nome: "",
    descricao: "",
    preco: "", // vamos guardar os centavos como string
    image: "",
    categoria: { id: "", nome: "" },
    fornecedor: { id: "", nome: "" },
    estoqueAtual: "0",
    estoqueMinimo: "0",
  });

  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

    const { fetchProdutos } =
    useProdutos();

  useEffect(() => {
    if (open) {
      fetchCategorias().then(setCategorias);
      fetchFornecedores().then(setFornecedores);
    }
  }, [open]);

  const handleChange = (key: keyof Produto, value: any) =>
    setForm({ ...form, [key]: value });

  const handleSelectChange = (path: "categoria" | "fornecedor", id: string) => {
    const list = path === "categoria" ? categorias : fornecedores;
    const selected = list.find((item) => item.id === id);
    if (selected) setForm({ ...form, [path]: selected });
  };

  // Formata centavos para BRL tipo app de banco
  const formatAsMoney = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "0,00";
    const number = parseInt(digits, 10);
    const reais = (number / 100).toFixed(2);
    return reais.replace(".", ",");
  };

  // Atualiza o estado com apenas os dígitos
  const handlePriceInput = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setForm({ ...form, preco: digits });
  };

  const canSave = useMemo(() => {
    return (
      (form.nome?.trim()?.length ?? 0) > 0 &&
      (form.preco?.length ?? 0) > 0
    );
  }, [form]);

  const onSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const precoNumber = (Number(form.preco) / 100).toFixed(2); // converte centavos para reais
      onCreate({ ...form, preco: precoNumber });
      onOpenChange(false);
      setForm({
        nome: "",
        descricao: "",
        preco: "",
        image: "",
        categoria: { id: "", nome: "" },
        fornecedor: { id: "", nome: "" },
        estoqueAtual: "0",
        estoqueMinimo: "0",
      });

      fetchProdutos();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Criar novo produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nome-create">Nome</Label>
              <Input
                id="nome-create"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preco-create">Preço (R$)</Label>
              <Input
                id="preco-create"
                value={formatAsMoney(form.preco)}
                onChange={(e) => handlePriceInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-create">URL da imagem</Label>
            <Input
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
              className="min-h-28"
            />
          </div>

          <Separator />

          {/* Categoria e Fornecedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoriaNome-create" className="flex items-center gap-2">
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

            <div className="space-y-2">
              <Label htmlFor="fornecedorNome-create" className="flex items-center gap-2">
                <Package className="w-4 h-4" /> Fornecedor
              </Label>
              <Select
                value={form.fornecedor.id}
                onValueChange={(id) => handleSelectChange("fornecedor", id)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((forn) => (
                    <SelectItem key={forn.id} value={forn.id}>
                      {forn.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoqueAtual-create" className="flex items-center gap-2">
                <Boxes className="w-4 h-4" /> Estoque Atual
              </Label>
              <Input
                id="estoqueAtual-create"
                value={String(form.estoqueAtual)}
                onChange={(e) =>
                  handleChange("estoqueAtual", e.target.value.replace(/[^0-9-]/g, ""))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo-create">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo-create"
                value={String(form.estoqueMinimo)}
                onChange={(e) =>
                  handleChange("estoqueMinimo", e.target.value.replace(/[^0-9-]/g, ""))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
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
 * Tela principal de produtos (sem alterações nesta parte)
 */
const Products: React.FC = () => {
  // CORREÇÃO 1: Usar as funções e estados corretos do contexto e remover "as any"
  const { produtos, loading, createProduto, updateProduto, deleteProduto } =
    useProdutos();

  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome-asc");

  const handleOpenEdit = (produto: Produto) => {
    setSelectedProduct(produto);
    setOpenEdit(true);
  };

  // CORREÇÃO 2: Ajustar o handleSave para enviar os dados no formato correto para o contexto
  const handleSave = (produtoAtualizado: Produto) => {
    if (typeof updateProduto === "function") {
      const { id, ...dadosParaAtualizar } = produtoAtualizado;
      updateProduto(id, dadosParaAtualizar);
    }
  };

  // CORREÇÃO 3: Ajustar o handleCreate para chamar a função correta e enviar os dados sem o ID temporário
  const handleCreate = (novoProduto: Omit<Produto, "id">) => {
    if (typeof createProduto === "function") {
      createProduto(novoProduto);
    }
  };

  const estoqueBadge = (atual?: string | number, minimo?: string | number) => {
    const a = Number(atual ?? 0);
    const m = Number(minimo ?? 0);
    if (Number.isNaN(a) || Number.isNaN(m)) return null;
    if (a <= 0)
      return (
        <Badge variant="destructive" className="font-semibold">
          Esgotado
        </Badge>
      );
    if (a <= m)
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
          Estoque Baixo
        </Badge>
      );
    return (
      <Badge
        variant="secondary"
        className="border-green-500/50 border text-green-700"
      >
        Em Estoque
      </Badge>
    );
  };

  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];
    const termoBusca = filtro.toLowerCase().trim();
    if (!termoBusca) return produtos;
    return produtos.filter(
      (p: Produto) =>
        p.nome.toLowerCase().includes(termoBusca) ||
        p.descricao.toLowerCase().includes(termoBusca) ||
        p.categoria?.nome?.toLowerCase().includes(termoBusca) ||
        p.fornecedor?.nome?.toLowerCase().includes(termoBusca)
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
      } else if (criterio === "preco") {
        valA = Number(a.preco);
        valB = Number(b.preco);
      }
      if (valA < valB) return direcao === "asc" ? -1 : 1;
      if (valA > valB) return direcao === "asc" ? 1 : -1;
      return 0;
    });
    return copia;
  }, [produtosFiltrados, ordenacao]);

  // CORREÇÃO 4: Usar o estado de 'loading' do contexto para um feedback melhor
  if (loading && produtos.length === 0) {
    return <p className="text-center py-12">Carregando produtos...</p>;
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
          Gerenciamento de Produtos
        </h1>
        <p className="text-muted-foreground text-lg">
          Visualize, adicione, edite e organize seus produtos com facilidade.
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
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
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={ordenacao} onValueChange={setOrdenacao}>
            <SelectTrigger className="w-full md:w-[180px] h-10">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="preco-asc">Preço (Menor)</SelectItem>
              <SelectItem value="preco-desc">Preço (Maior)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpenCreate(true)} className="h-10 gap-2">
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Adicionar Produto</span>
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {!loading && produtos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <LayoutGrid className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">
              Nenhum produto cadastrado
            </h3>
            <p className="mt-1 text-muted-foreground">
              Clique em "Adicionar Produto" para começar.
            </p>
          </motion.div>
        ) : produtosOrdenados.filter((p) => p.nome !== "Produto Excluido")
            .length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <XCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold">
              Nenhum resultado encontrado
            </h3>
            <p className="mt-1 text-muted-foreground">
              Tente uma busca diferente ou limpe o filtro.
            </p>
            <Button variant="link" onClick={() => setFiltro("")}>
              Limpar busca
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
          >
            {produtosOrdenados.filter((p: Produto) => p.nome !== "Produto Excluido").map((produto: Produto, i: number) => (
              <motion.div key={produto.id} variants={cardVariants} custom={i}>
                <Card className="shadow-sm border-border/60 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full">
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      {estoqueBadge(
                        produto.estoqueAtual,
                        produto.estoqueMinimo
                      )}
                    </div>
                    <div className="overflow-hidden h-48">
                      <img
                        src={
                          produto.image ||
                          "https://placehold.co/600x400?text=Foto+Produto"
                        }
                        alt={produto.nome}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold tracking-tight line-clamp-1">
                      {produto.nome}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2 pt-1 min-h-[40px]">
                      {produto.descricao}
                    </p>
                    <p className="text-sm bg-background bg-green-200 rounded-md p-2">
                      Estoque atual: {produto.estoqueAtual}
                    </p>
                    <span className="text-sm bg-background bg-yellow-200 rounded-md p-2">
                      Estoque mínimo: {produto.estoqueMinimo}
                    </span>
                    <span></span>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-end justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <TagIcon size={14} />{" "}
                          {produto.categoria?.nome || "Sem categoria"}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Package size={14} />{" "}
                          {produto.fornecedor?.nome || "Sem fornecedor"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-primary">
                          un. R${" "}
                          {Number(produto.preco).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEdit(produto)}
                      >
                        <Edit3 className="w-4 h-4 mr-2" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduto(produto.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
    </div>
  );
};

export default Products;
