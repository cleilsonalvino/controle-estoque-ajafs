
import { Venda } from "@/pages/SalesDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface NotaFiscalModalProps {
  sale: Venda;
  onClose: () => void;
  onConfirm: (saleId: string) => void;
}

const NotaFiscalModal = ({ sale, onClose, onConfirm }: NotaFiscalModalProps) => {

  const subtotal = sale.itens?.reduce((acc, item) => acc + Number(item.precoUnitario) * Number(item.quantidade), 0) || 0;
  const discountAmount = (subtotal * Number(sale.desconto)) / 100;
  const total = subtotal - discountAmount;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar Emissão de Nota Fiscal</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Cliente:</strong> {sale.cliente?.nome || "Não informado"}</p>
            <p><strong>Vendedor:</strong> {sale.salesperson || "Não informado"}</p>
          </div>
          <div>
            <p><strong>Data:</strong> {new Date(sale.criadoEm).toLocaleDateString('pt-BR')}</p>
            <p><strong>Status:</strong> {sale.status}</p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-bold">Itens da Venda</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.itens?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.produtoId}</TableCell>
                  <TableCell>{String(item.quantidade)}</TableCell>
                  <TableCell className="text-right">{Number(item.precoUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell className="text-right">{(Number(item.precoUnitario) * Number(item.quantidade)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <div className="text-right">
            <p><strong>Subtotal:</strong> {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <p><strong>Desconto:</strong> {Number(sale.desconto).toFixed(2)}%</p>
            <p className="font-bold text-lg"><strong>Total:</strong> {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(sale.id)}>Confirmar Emissão</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotaFiscalModal;
