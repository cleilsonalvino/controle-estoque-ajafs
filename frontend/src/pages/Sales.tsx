// src/pages/Sales.tsx

import { useState } from "react";
import { useSales, SaleItem } from "@/contexts/SalesContext";
import { useClientes } from "@/contexts/ClienteContext";
import { useVendedores } from "@/contexts/VendedorContext";
import { useProdutos } from "@/contexts/ProdutoContext";
import CupomFiscal from "@/components/CupomFiscal";
import PDV from "./PDV"; // Seu componente PDV

const Sales = () => {
    const { createSale } = useSales();
    const { clientes } = useClientes();
    const { vendedores } = useVendedores();
    const { produtos } = useProdutos();
    
    const [showCupom, setShowCupom] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);

    const handleFinalizeSale = async (saleData: {
        saleItems: SaleItem[];
        clienteId?: string;
        vendedorId: string;
        desconto: number;
        formaPagamento: string;
    }) => {
        const salePayload = {
            clienteId: saleData.clienteId,
            vendedorId: saleData.vendedorId,
            desconto: saleData.desconto,
            forma_pagamento: saleData.formaPagamento,
            itens: saleData.saleItems.map((item) => ({
                produtoId: item.type === "produto" ? item.id : undefined,
                servicoId: item.type === "servico" ? item.id : undefined,
                quantidade: item.quantity,
                precoUnitario: item.type === "produto" ? item.precoVenda : item.precoCusto,
            })),
        };

        try {
            await createSale(salePayload);

            const clientName = clientes.find((c) => c.id === saleData.clienteId)?.nome || "Não informado";
            const vendedorName = vendedores.find((v) => v.id === saleData.vendedorId)?.nome || "";
            const subtotal = saleData.saleItems.reduce(
                (acc, item) => acc + (item.precoVenda || item.precoCusto || 0) * item.quantity,
                0
            );
            const total = subtotal - (subtotal * saleData.desconto) / 100;

            setLastSale({
                saleItems: saleData.saleItems,
                total,
                discount: saleData.desconto,
                paymentMethod: saleData.formaPagamento,
                clientName,
                vendedorName,
            });

            setShowCupom(true);
            alert("Venda finalizada com sucesso!");
            return true; // Sucesso
        } catch (err) {
            console.error(err);
            alert("Erro ao criar venda.");
            return false; // Falha
        }
    };

    // Renderiza o PDV diretamente, sem a tela de "entrar no modo PDV"
    return (
        <>
            {showCupom && lastSale && (
                <CupomFiscal {...lastSale} onClose={() => setShowCupom(false)} />
            )}
            <PDV
                produtos={produtos}
                clientes={clientes}
                vendedores={vendedores}
                onFinalizeSale={handleFinalizeSale}
                // Use a navegação do react-router-dom para voltar ao dashboard
                onExit={() => window.location.href = '/'} 
            />
        </>
    );
};

export default Sales;