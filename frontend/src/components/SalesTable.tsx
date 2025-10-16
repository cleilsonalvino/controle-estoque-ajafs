import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { SaleItem } from "@/pages/Sales";

interface SalesTableProps {
  items: SaleItem[];
  discount: number;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const SalesTable = ({ items, discount, onRemoveItem, onUpdateQuantity }: SalesTableProps) => {
  const subtotal = items.reduce((acc, item) => acc + Number(item.preco) * item.quantity, 0);
  console.log(discount)
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  return (
    <Table className="bg-gray-300 rounded-lg shadow-md overflow-hidden">
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead className="w-[100px]">Qtd.</TableHead>
          <TableHead className="text-right">Preço Unit.</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length > 0 ? (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nome}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
                  className="w-16"
                />
              </TableCell>
              <TableCell className="text-right">{item.preco}</TableCell>
              <TableCell className="text-right">{(Number(item.preco) * item.quantity).toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Nenhum produto na venda.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-bold">Subtotal</TableCell>
          <TableCell className="text-right font-bold">{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-bold">Desconto</TableCell>
          <TableCell className="text-right font-bold">{discount}%</TableCell>
          <TableCell></TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
          <TableCell className="text-right font-bold">{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};