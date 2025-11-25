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

const CupomFiscal = ({
  saleItems,
  total,
  discount,
  paymentMethod,
  vendedor,
  dataHora,
  onClose,
}: CupomFiscalProps) => {
  const { user } = useAuth();
  const empresa = user?.empresa;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 print:bg-white print:block">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm print:max-w-full print:shadow-none print:rounded-none print:p-2 text-[12px] leading-tight font-mono">

        {/* Cabeçalho */}
        <div className="text-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold tracking-wide">CUPOM FISCAL</h2>

          <p className="font-semibold mt-2">{empresa?.nomeFantasia}</p>
          <p className="text-gray-700">{empresa?.razaoSocial}</p>
          <p className="text-gray-700">CNPJ: {empresa?.cnpj}</p>

          <p className="text-gray-700 mt-1">{empresa?.endereco}</p>
          <p className="text-gray-700">{empresa?.telefone}</p>
        </div>

        {/* Infos adicionais */}
        <div className="mb-3 text-[12px]">
          <p><span className="font-bold">Vendedor:</span> {vendedor}</p>
          {dataHora && (
            <p><span className="font-bold">Data/Hora:</span> {dataHora}</p>
          )}
        </div>

        {/* Itens */}
        <div className="border-t border-b py-3 space-y-1">
          {saleItems.map((item) => (
            <div key={item.id} className="flex justify-between text-[12px]">
              <span>
                {item.produto?.nome || item.id} x{item.quantidade}
              </span>
              <span>
                {(item.precoVenda * item.quantidade).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="py-3 text-[12px]">
          <div className="flex justify-between">
            <span>Desconto</span>
            <span>{discount.toFixed(2)}%</span>
          </div>

          <div className="flex justify-between font-bold text-lg my-1">
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

        {/* Mensagem final */}
        <p className="text-center text-[11px] border-t pt-2 mt-2">
          Obrigado pela preferência!
        </p>

        {/* Botões (não aparecem na impressão) */}
        <div className="mt-4 flex justify-between gap-2 print:hidden">
          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
          <Button onClick={handlePrint} className="w-full">
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CupomFiscal;
