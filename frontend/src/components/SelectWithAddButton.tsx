import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  items: { id: string; nome: string }[];
  onAdd: () => void; // abre o modal
}

export const SelectWithAddButton = ({
  label,
  value,
  onChange,
  items,
  onAdd,
}: Props) => {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <div className="flex gap-2 items-center">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
          </SelectTrigger>

          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" size="icon" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
