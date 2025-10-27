
import { SaleItem } from "@/contexts/SalesContext";
import { Button } from "./ui/button";

interface CupomFiscalProps {
  saleItems: SaleItem[];
  total: number;
  discount: number;
  paymentMethod: string;
  clientName: string;
  vendedorName: string;
  onClose: () => void;
}

const CupomFiscal = ({ saleItems, total, discount, paymentMethod, clientName, vendedorName, onClose }: CupomFiscalProps) => {

  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Cupom Fiscal</h2>
          <p className="text-gray-500">Inventário Brilhante</p>
        </div>
        <div className="mb-4">
          <p><strong>Cliente:</strong> {clientName}</p>
          <p><strong>Vendedor:</strong> {vendedorName}</p>
        </div>
        <div className="border-t border-b py-4">
          {saleItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.produto.nome} (x{item.quantidade})</span>
              <span>{(item.precoVenda * item.quantidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          ))}
        </div>
        <div className="py-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{saleItems.reduce((acc, item) => acc + item.precoVenda * item.quantidade, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Desconto</span>
            <span>{discount.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Forma de Pagamento</span>
            <span>{paymentMethod}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={handlePrint}>Imprimir</Button>
        </div>
      </div>
    </div>
  );
};

export default CupomFiscal;
