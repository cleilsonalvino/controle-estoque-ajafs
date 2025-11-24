import React, { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { TagIcon } from "lucide-react";
import { Produto, useProdutos } from "@/contexts/ProdutoContext";
import { Category as Categoria } from "@/contexts/CategoryContext";
import { Supplier as Fornecedor } from "@/contexts/SupplierContext";
import { toast } from "sonner";
import {
  Dialog as InnerDialog,
  DialogContent as InnerDialogContent,
  DialogFooter as InnerDialogFooter,
  DialogHeader as InnerDialogHeader,
  DialogTitle as InnerDialogTitle,
} from "@/components/ui/dialog";

interface EditProdutoDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto: Produto | null;
  onSave: (p: Produto) => void;
  categorias: Categoria[];
  fornecedores: Fornecedor[];
}

export const EditProdutoDialog: React.FC<EditProdutoDialogProps> = ({
  open,
  onOpenChange,
  produto,
  onSave,
  categorias,
  fornecedores,
}) => {
  const { fetchMarcaProduto, createMarcaProduto } = useProdutos();

  const initialStateProduto = {
    id: produto?.id || "",
    nome: produto?.nome || "",
    precoVenda: produto?.precoVenda || "",
    urlImage: produto?.urlImage || "",
    descricao: produto?.descricao || "",
    categoria: produto?.categoria || { id: "", nome: "" },
    marca: produto?.marca || { id: "", nome: "" },
    estoqueMinimo: produto?.estoqueMinimo || "0",
    quantidadeTotal: produto?.quantidadeTotal || 0,
    codigoBarras: produto?.codigoBarras || "",
    lote: produto?.lote || [],
  };

  const [form, setForm] = useState<Produto | null>(initialStateProduto as any);
  const [saving, setSaving] = useState(false);
  const [precoVendaInput, setPrecoVendaInput] = useState("");

  const [marcas, setMarcas] = useState<any[]>([]);
  const [novaMarca, setNovaMarca] = useState("");
  const [openDialogMarca, setOpenDialogMarca] = useState(false);

  useEffect(() => {
    setForm(produto ? (produto as any) : null);
  }, [produto]);

  useEffect(() => {
    setPrecoVendaInput(
      produto ? produto.precoVenda.toString().replace(".", ",") : ""
    );
  }, [produto]);

  const handleChange = (key: keyof Produto, value: any) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
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

  const handlePriceInput = (v: string) => {
    const cleaned = v.replace(/[^0-9,]/g, "");
    setPrecoVendaInput(cleaned);
  };

  const handleSelectChange = (path: "categoria" | "marca", id: string) => {
    const list = path === "categoria" ? categorias : marcas;
    const selected = list.find((item) => item.id === id);
    if (selected) setForm({ ...form, [path]: selected } as any);
  };

  const getImageUrl = (value: string | File | null) => {
    if (!value) {
      return "https://placehold.co/600x400?text=Sem+Imagem";
    }
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    if (value.startsWith("http")) {
      return value;
    }
    const cleanPath = value.startsWith("/") ? value.substring(1) : value;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  const canSave = useMemo(() => {
    if (!form) return false;
    return (form.nome?.trim()?.length ?? 0) > 0 && precoVendaInput.length > 0;
  }, [form, precoVendaInput]);

  const onSubmit = async () => {
    if (!form || !canSave) return;

    try {
      setSaving(true);
      onSave({
        ...form,
        precoVenda: Number(
          precoVendaInput.replace(/\./g, "").replace(",", ".")
        ) as any,
      });

      toast.success("Produto atualizado com sucesso.");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              Editar produto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* CAMPOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome</Label>
                <Input
                  className="border-gray-500"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Preço de venda</Label>
                <Input
                  className="border-gray-500"
                  value={precoVendaInput}
                  onChange={(e) => handlePriceInput(e.target.value)}
                  onBlur={formatPrecoOnBlur}
                />
              </div>

              {/* MARCA */}
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select
                  value={form.marca?.id}
                  onOpenChange={async (openSelect) => {
                    if (openSelect) {
                      const data = await fetchMarcaProduto();
                      setMarcas(data || []);
                    }
                  }}
                  onValueChange={(id) => handleSelectChange("marca", id)}
                >
                  <SelectTrigger className="border-gray-500">
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>

                  <SelectContent>
                    {marcas.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id}>
                        {marca.nome}
                      </SelectItem>
                    ))}

                    <div className="border-t my-2" />

                    <div className="px-2 pb-2">
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        onClick={() => setOpenDialogMarca(true)}
                      >
                        Nova marca
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label>Código de barras</Label>
                <Input
                  className="border-gray-500"
                  value={form.codigoBarras || ""}
                  onChange={(e) => handleChange("codigoBarras", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label>Imagem do produto</Label>
                <Input
                  className="border-gray-500"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleChange("urlImage", file as any);
                  }}
                />
              </div>

              {form.urlImage && (
                <div className="mt-2 flex justify-center md:col-span-3">
                  <img
                    src={getImageUrl(form.urlImage as any)}
                    className="w-24 h-24 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            {/* DESCRIÇÃO */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                className="min-h-28 border-gray-500"
                value={form.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
              />
            </div>

            <Separator />

            {/* CATEGORIA E ESTOQUE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
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
                <Label>Estoque mínimo</Label>
                <Input
                  className="border-gray-500"
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

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit} disabled={!canSave || saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CRIAR MARCA */}
      <InnerDialog open={openDialogMarca} onOpenChange={setOpenDialogMarca}>
        <InnerDialogContent className="sm:max-w-md">
          <InnerDialogHeader>
            <InnerDialogTitle>Criar nova marca</InnerDialogTitle>
          </InnerDialogHeader>

          <div className="space-y-4 py-2">
            <Label>Nome da marca</Label>
            <Input
              placeholder="Digite o nome da marca"
              value={novaMarca}
              onChange={(e) => setNovaMarca(e.target.value)}
              className="border-gray-500"
            />
          </div>

          <InnerDialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenDialogMarca(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!novaMarca.trim()) return;

                try {
                  const nova = await createMarcaProduto(novaMarca);
                  if (nova) {
                    setMarcas((prev) => [...prev, nova]);
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            marca: nova,
                          }
                        : prev
                    );
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
          </InnerDialogFooter>
        </InnerDialogContent>
      </InnerDialog>
    </>
  );
};
