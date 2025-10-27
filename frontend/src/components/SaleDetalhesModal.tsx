import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sale } from "../contexts/SalesContext";

interface SaleDetalhesModalProps {
  sale: Sale;
  children: React.ReactNode;
}

const SaleDetalhesModal: React.FC<SaleDetalhesModalProps> = ({
  sale,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
          <DialogTitle>Detalhes da Venda #{sale.numero}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">ID da Venda:</span>
            <span className="col-span-3 text-sm">{sale.id}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Número:</span>
            <span className="col-span-3 text-sm">{sale.numero}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Cliente:</span>
            <span className="col-span-3 text-sm">
              {sale.cliente?.nome || "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Vendedor:</span>
            <span className="col-span-3 text-sm">
              {sale.vendedor?.nome || "Não informado"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Status:</span>
            <span className="col-span-3 text-sm">{sale.status}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Forma de Pagamento:</span>
            <span className="col-span-3 text-sm">{sale.formaPagamento}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Total:</span>
            <span className="col-span-3 text-sm">
              R$ {Number(sale.total)}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Desconto:</span>
            <span className="col-span-3 text-sm">% {sale.desconto}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">Criado Em:</span>
            <span className="col-span-3 text-sm">
              {new Date(sale.criadoEm).toLocaleString()}
            </span>
          </div>

          <h3 className="text-lg font-semibold mt-4">Itens da Venda:</h3>
          {sale.itens && sale.itens.length > 0 ? (
            <div className="space-y-2">
              {sale.itens.map((item, index) => (
                <div
                  key={item.id || index}
                  className="grid grid-cols-4 items-center gap-4 border-t pt-2"
                >
                  <span className="text-sm font-medium">Produto:</span>
                  <span className="col-span-3 text-sm">
                    {item.produto?.nome || "Não informado"}
                  </span>
                  <span className="text-sm font-medium">Quantidade:</span>
                  <span className="col-span-3 text-sm">{item.quantidade}</span>
                  <span className="text-sm font-medium">Preço Unitário:</span>
                  <span className="col-span-3 text-sm">
                    R$ {item.produto.precoVenda}
                  </span>
                  <span className="text-sm font-medium">Subtotal:</span>
                  <span className="col-span-3 text-sm">
                    R$ {item.quantidade * item.precoVenda}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum item nesta venda.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetalhesModal;
