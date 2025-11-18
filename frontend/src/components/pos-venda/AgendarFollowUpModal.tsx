import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePosVenda } from "@/contexts/PosVendaContext";
import { useState } from "react";
import { toast } from "sonner";
import { AgendarFollowUpData } from "@/types/pos-venda-dto";
import { TipoAcaoFollowUp } from "@/types/pos-venda";

interface AgendarFollowUpModalProps {
  posVendaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgendarFollowUpModal({
  posVendaId,
  open,
  onOpenChange,
}: AgendarFollowUpModalProps) {
  const { agendarFollowUp, loading } = usePosVenda();
  const [formData, setFormData] = useState<{
    dataAgendada: string;
    tipoAcao: TipoAcaoFollowUp;
    observacao: string;
  }>({
    dataAgendada: "",
    tipoAcao: "whatsapp",
    observacao: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: TipoAcaoFollowUp) => {
    setFormData((prev) => ({ ...prev, tipoAcao: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dataAgendada) {
      toast.error("Por favor, preencha a data do agendamento.");
      return;
    }
    const result = await agendarFollowUp(posVendaId, formData);

    if (result) {
      setFormData({
        dataAgendada: "",
        tipoAcao: "whatsapp",
        observacao: "",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataAgendada" className="text-right">
                Data
              </Label>
              <Input
                id="dataAgendada"
                name="dataAgendada"
                type="datetime-local"
                value={formData.dataAgendada}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipoAcao" className="text-right">
                Ação
              </Label>
              <Select
                onValueChange={handleSelectChange}
                defaultValue={formData.tipoAcao}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo de ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="ligacao">Ligação</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacao" className="text-right">
                Observação
              </Label>
              <Textarea
                id="observacao"
                name="observacao"
                value={formData.observacao}
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