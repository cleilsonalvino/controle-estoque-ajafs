import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category as Categoria } from "@/contexts/CategoryContext";
import { Supplier as Fornecedor } from "@/contexts/SupplierContext";
import { Produto, useProdutos } from "@/contexts/ProdutoContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreateProdutoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Omit<Produto, "id">) => void;
  categorias: Categoria[];
  fornecedores: Fornecedor[];
}

export const CreateProdutoDialog: React.FC<CreateProdutoDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
  categorias,
  fornecedores,
}) => {
  const initialState: Omit<Produto, "id"> = {
    nome: "",
    descricao: "",
    precoVenda: "",
    urlImage: "",
    categoria: { id: "", nome: "" },
    marca: {
      id: "",
      nome: "",
    },
    estoqueMinimo: "0",
    quantidadeTotal: 0,
    codigoBarras: "",
    lote: [],
    criadoEm: undefined,
  };

  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const { fetchMarcaProduto, createMarcaProduto } = useProdutos();
  const [marcas, setMarcas] = useState<any[]>([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState<{
    id: string;
    nome: string;
  }>({
    id: "",
    nome: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [novaMarca, setNovaMarca] = useState("");
  const [openDialogMarca, setOpenDialogMarca] = useState(false);

  const handleChange = (key: keyof typeof form, value: any) =>
    setForm({ ...form, [key]: value });

  const handleSelectChange = (path: "categoria" | "fornecedor", id: string) => {
    const list = path === "categoria" ? categorias : fornecedores;
    const selected = list.find((item) => item.id === id);
    if (selected) setForm({ ...form, [path]: selected } as any);
  };

  const handlePriceInput = (
    field: "precoCusto" | "precoVenda",
    value: string
  ) => {
    let digits = value.replace(/\D/g, "");
    if (digits === "") digits = "0";
    const numericValue = (parseInt(digits, 10) / 100).toFixed(2);
    const formatted = numericValue
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setForm((prev) => ({ ...prev, [field]: formatted } as any));
  };

  const canSave = useMemo(() => {
    return (form.nome?.trim()?.length ?? 0) > 0 && form.precoVenda.length > 0;
  }, [form]);

  const onSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const precoVendaNumber = parseFloat(
        form.precoVenda.replace(/\./g, "").replace(",", ".")
      ).toFixed(2);

      onCreate({
        ...form,
        precoVenda: precoVendaNumber as any,
        marca: { id: marcaSelecionada.id, nome: marcaSelecionada.nome },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-black">
              Criar novo produto
            </DialogTitle>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Trash
                    onClick={() => {
                      setForm(initialState);
                      setPreview(null);
                    }}
                    className="w-5 h-5 text-black cursor-pointer hover:text-red-300 transition-colors"
                  />
                </TooltipTrigger>
                <TooltipContent>Limpar formulário</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome-create">
                Nome<span className="text-red-500">*</span>
              </Label>
              <Input
                className="border-slate-900"
                id="nome-create"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca-create">Marca</Label>
              <Select
                onOpenChange={async (openSelect) => {
                  if (openSelect) {
                    const data = await fetchMarcaProduto();
                    setMarcas(data || []);
                  }
                }}
                onValueChange={(id) => {
                  const marca = marcas.find((m) => m.id === id);
                  if (marca) {
                    setMarcaSelecionada({ id: marca.id, nome: marca.nome });
                    handleChange("marca", marca);
                  }
                }}
                value={marcaSelecionada.id}
              >
                <SelectTrigger className="border-slate-900">
                  <SelectValue placeholder="Selecione ou crie uma marca" />
                </SelectTrigger>

                <SelectContent>
                  {marcas.length > 0 ? (
                    marcas.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id}>
                        {marca.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      Nenhuma marca encontrada
                    </div>
                  )}

                  <div className="border-t my-2" />
                  <div className="px-2 pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-sm justify-center"
                      onClick={() => setOpenDialogMarca(true)}
                    >
                      Nova marca
                    </Button>
                  </div>
                </SelectContent>
              </Select>

              <Dialog open={openDialogMarca} onOpenChange={setOpenDialogMarca}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar nova marca</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <Label htmlFor="nova-marca">Nome da marca</Label>
                    <Input
                      id="nova-marca"
                      placeholder="Digite o nome da marca"
                      value={novaMarca}
                      onChange={(e) => setNovaMarca(e.target.value)}
                      className="border-slate-900"
                    />
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialogMarca(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!novaMarca.trim()) return;
                        try {
                          const nova = await createMarcaProduto(novaMarca);
                          if (nova) {
                            setMarcas((prev) => [...prev, nova]);
                            setMarcaSelecionada({
                              id: nova.id,
                              nome: nova.nome,
                            });
                            handleChange("marca", nova);
                          }
                          setNovaMarca("");
                          setOpenDialogMarca(false);
                        } catch (error) {
                          console.error("Erro ao criar marca:", error);
                        }
                      }}
                    >
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco-venda-create">
                Preço de venda R{"$"}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                className="border-slate-900"
                id="preco-venda-create"
                value={form.precoVenda}
                onChange={(e) => handlePriceInput("precoVenda", e.target.value)}
                placeholder="0,00"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="codigo-barras-create">Código de barras</Label>
              <Input
                className="border-slate-900"
                id="codigo-barras-create"
                value={form.codigoBarras ?? ""}
                onChange={(e) => handleChange("codigoBarras", e.target.value)}
                placeholder="Deixe vazio para gerar automaticamente"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-create">Imagem do produto</Label>
            <Input
              className="border-slate-900"
              id="image-create"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleChange("urlImage", file as any);
                  const previewUrl = URL.createObjectURL(file);
                  setPreview(previewUrl);
                }
              }}
            />

            {preview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={preview}
                  alt="Prévia do produto"
                  className="w-32 h-32 object-contain border rounded-md shadow-sm bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150?text=Imagem+Invalida";
                  }}
                />
              </div>
            )}
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
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo-create">Estoque mínimo</Label>
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
