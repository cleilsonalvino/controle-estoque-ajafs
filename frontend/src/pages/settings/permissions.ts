// src/pages/Settings/permissions.ts

import { allMenuItems } from "@/config/menuItems";

export const getGroupedMenuPermissions = () => {
  const grupos: Record<string, any[]> = {
    Gestão: [],
    Cadastros: [],
    Serviços: [],
    Financeiro: [],
    Outros: [],
  };

  // Remover telas que não devem ser permissões
  const filtrados = allMenuItems.filter(
    (item) =>
      !["/", "/super-admin", "/super-admin/criarEmpresa"].includes(item.url)
  );

  filtrados.forEach((item) => {
    // FINANCEIRO
    if (item.key.startsWith("financeiro-")) {
      grupos.Financeiro.push(item);
      return;
    }

    // GESTÃO
    if (["estoque", "dashboard-sales", "sales", "pos-venda"].includes(item.key)) {
      grupos.Gestão.push(item);
      return;
    }

    // CADASTROS
    if (
      [
        "products",
        "movements",
        "suppliers",
        "categories",
        "clientes",
        "vendedores",
      ].includes(item.key)
    ) {
      grupos.Cadastros.push(item);
      return;
    }

    // SERVIÇOS
    if (["tipos-servicos", "service-categories"].includes(item.key)) {
      grupos.Serviços.push(item);
      return;
    }

    // OUTROS
    grupos.Outros.push(item);
  });

  // Remove categorias vazias
  return Object.entries(grupos).filter(([_, items]) => items.length > 0);
};
