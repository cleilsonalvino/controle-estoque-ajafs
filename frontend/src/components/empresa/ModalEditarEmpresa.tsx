import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmpresa } from "@/contexts/EmpresaContext";

export function ModalEditarEmpresa({ empresa, open, onClose }: any) {
  const { updateEmpresa } = useEmpresa();
  const [form, setForm] = useState(empresa || {});

  const handleChange = (key: string, v: any) => {
    setForm((prev: any) => ({ ...prev, [key]: v }));
  };

  const salvar = async () => {
    await updateEmpresa(form, empresa.id);
    onClose();
  };

  if (!empresa) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nome Fantasia</Label>
            <Input
              value={form.nome_fantasia || ""}
              onChange={(e) => handleChange("nome_fantasia", e.target.value)}
            />
          </div>
          <div>
            <Label>Razão Social</Label>
            <Input
              value={form.razao_social || ""}
              onChange={(e) => handleChange("razao_social", e.target.value)}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              value={form.telefone || ""}
              onChange={(e) => handleChange("telefone", e.target.value)}
            />
          </div>

          <div>
            <Label>Cidade</Label>
            <Input
              value={form.cidade || ""}
              onChange={(e) => handleChange("cidade", e.target.value)}
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Input
              value={form.estado || ""}
              onChange={(e) => handleChange("estado", e.target.value)}
            />
          </div>
        </div>

        <Button className="mt-4 w-full" onClick={salvar}>
          Salvar Alterações
        </Button>
      </DialogContent>
    </Dialog>
  );
}
