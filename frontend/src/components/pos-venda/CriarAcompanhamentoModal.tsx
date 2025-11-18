
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePosVenda } from "@/contexts/PosVendaContext";
import { useState } from "react";
import { toast } from "sonner";

interface CriarAcompanhamentoModalProps {
  children: React.ReactNode;
}

export function CriarAcompanhamentoModal({
  children,
}: CriarAcompanhamentoModalProps) {
  const { createPosVenda, loading } = usePosVenda();
  const [formData, setFormData] = useState({
    vendaId: "",
    clienteId: "",
    observacoes: "",
  });
  const [open, setOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendaId || !formData.clienteId) {
      toast.error("Por favor, preencha o ID da Venda e do Cliente.");
      return;
    }
    const result = await createPosVenda(formData);

    if (result) {
      setFormData({ vendaId: "", clienteId: "", observacoes: "" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Acompanhamento Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendaId" className="text-right">
                ID da Venda
              </Label>
              <Input
                id="vendaId"
                name="vendaId"
                value={formData.vendaId}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clienteId" className="text-right">
                ID do Cliente
              </Label>
              <Input
                id="clienteId"
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacoes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
