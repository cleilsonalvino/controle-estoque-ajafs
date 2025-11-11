import { SaleItem } from "@/contexts/SalesContext";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/useAuth";

interface CupomFiscalProps {
  saleItems: SaleItem[];
  total: number;
  discount: number;
  paymentMethod: string;
  vendedor: string;
  dataHora?: string;
  onClose: () => void;
}

const CupomFiscal = ({ saleItems, total, discount, paymentMethod, vendedor, dataHora, onClose }: CupomFiscalProps) => {
  const { user } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  const empresa = user?.empresa;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md print:w-full print:shadow-none">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Cupom Fiscal</h2>
          <p className="text-gray-600">{empresa?.nomeFantasia}</p>
          <p className="text-gray-500">{empresa?.razaoSocial}</p>
          <p className="text-gray-500">CNPJ: {empresa?.cnpj}</p>
          <p className="text-gray-500">{empresa?.endereco}</p>
          <p className="text-gray-500">{empresa?.telefone}</p>
        </div>

        <div className="mb-4 text-sm">
          <p><strong>Vendedor:</strong> {vendedor}</p>
          {dataHora && <p><strong>Data/Hora:</strong> {dataHora}</p>}
        </div>

        <div className="border-t border-b py-4 text-sm">
          {saleItems.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.produto?.nome || item.id} (x{item.quantidade})</span>
              <span>
                {(item.precoVenda * item.quantidade).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          ))}
        </div>

        <div className="py-4 text-sm">
          <div className="flex justify-between">
            <span>Desconto</span>
            <span>{discount.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Forma de Pagamento</span>
            <span>{paymentMethod}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handlePrint}>Imprimir</Button>
        </div>
      </div>
    </div>
  );
};

export default CupomFiscal;
