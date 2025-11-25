// src/pages/HomePage.tsx

import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { allMenuItems } from "@/config/menuItems";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Box,
  Users,
  Building,
  Settings,
  Home,
  Warehouse,
  User,
} from "lucide-react";
import {api} from "@/lib/api";
import { useEmpresa } from "@/contexts/EmpresaContext";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  "/": Home,
  "/estoque": Warehouse,
  "/dashboard-sales": LayoutDashboard,
  "/sales": ShoppingCart,
  "/products": Box,
  "/clientes": Users,
  "/suppliers": Building,
  "/settings": Settings,
  "/vendedores": User,
};

export function HomePage() {
  const { user } = useAuth();
  const { findUniqueEmpresa } = useEmpresa();

  const [dashboard, setDashboard] = useState<any>(null);
  const [empresaDados, setEmpresaDados] = useState<any>(null);
  const [loadingEmpresaData, setLoadingEmpresaData] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // ✅ useCallback para impedir recriação de função em toda renderização
  const fetchEmpresaData = useCallback(async (empresaId: string) => {
    if (!empresaId) return;

    console.log(user)
    try {
      setLoadingEmpresaData(true);
      const data = await findUniqueEmpresa(empresaId);
      setEmpresaDados(data);
    } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error);
      toast.error("Erro ao buscar dados da empresa");
    } finally {
      setLoadingEmpresaData(false);
    }
  }, [findUniqueEmpresa]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);
      const { data } = await api.get("/dashboard");
      setDashboard(data);
    } catch (err) {
      console.error("Erro ao buscar dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // ✅ Rodar uma única vez por refresh
  useEffect(() => {
    if (!user) return;

    // Evita chamadas múltiplas
    if (user.papel === "ADMINISTRADOR" && !dashboard) {
      fetchDashboard();
    }

    if (user.empresa?.id && !empresaDados) {
      fetchEmpresaData(user.empresa.id);
    }
  }, [user, fetchDashboard, fetchEmpresaData, dashboard, empresaDados]);

  if (!user) return <div>Carregando informações do usuário...</div>;

  const email = user.email?.toLowerCase();
  const isAdmin = user.papel?.toLowerCase() === "administrador";
  const isMaster = email === "ajafs@admin.com";

  const accessibleMenuItems = useMemo(() => {
    if (isMaster) {
      return allMenuItems.filter((item) => item.url !== "/");
    }
    if (isAdmin) {
      return allMenuItems.filter(
        (item) => item.url !== "/" && item.key !== "super_admin"
      );
    }
    return allMenuItems.filter(
      (item) =>
        item.url !== "/" &&
        item.key !== "super_admin" &&
        user.telasPermitidas?.includes(item.url)
    );
  }, [isAdmin, isMaster, user]);

    const getImageUrl = (value: string | File | null) => {
    if (!value) {
      return "https://placehold.co/600x400?text=Sem+Imagem";
    }

    // Se for File (nova imagem escolhida)
    if (value instanceof File) {
      return URL.createObjectURL(value); // <- gera preview AUTOMÁTICO
    }

    console.log(user)

    // Se já for URL externa
    if (value.startsWith("http")) {
      return value;
    }

    // Se for caminho relativo salvo no banco
    const cleanPath = value.startsWith("/") ? value.substring(1) : value;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-row items-center space-y-2 justify-between"
      >
        <h1 className="text-3xl font-bold">
          Bem-vindo(a), {user.nome}!
          <p className="text-muted-foreground capitalize text-sm font-normal">
            {user.papel?.toUpperCase()}(A)
          </p>
        </h1>
        {isMaster && (
          <span className="ml-2 text-xs px-2 py-1 rounded bg-primary text-primary-foreground uppercase">
            Acesso Master
          </span>
        )}
        <img
          src={getImageUrl(user.empresa?.logoEmpresa)}
          alt="logo da empresa"
          className="p-2 w-28 cursor-pointer"
        />
      </motion.div>

      {/* Card de informações da empresa */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[350px] max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            {loadingEmpresaData ? (
              <p>Carregando dados da empresa...</p>
            ) : empresaDados ? (
              <>
                <div><strong>Razão Social:</strong><p>{empresaDados.razaoSocial}</p></div>
                <div><strong>Nome Fantasia:</strong><p>{empresaDados.nomeFantasia}</p></div>
                <div><strong>CNPJ:</strong><p>{empresaDados.cnpj}</p></div>
                <div><strong>Telefone:</strong><p>{empresaDados.telefone}</p></div>
                <div><strong>Email:</strong><p>{empresaDados.email ?? "--"}</p></div>
                <div><strong>Cidade/Estado:</strong><p>{empresaDados.cidade} / {empresaDados.estado}</p></div>
              </>
            ) : (
              <p>Nenhuma informação da empresa cadastrada.</p>
            )}
          </CardContent>
        </Card>

        {/* Card de informações do usuário */}
        <Card className="flex-1 min-w-[350px] max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Nome:</strong><p>{user.nome}</p></div>
            <div><strong>Email:</strong><p>{user.email}</p></div>
            <div><strong>Status:</strong><p>{user.ativo ? "Ativo" : "Inativo"}</p></div>
            <div><img className="w-20 h-20 rounded-full" src={getImageUrl(user.urlImagem)} alt="imagem do usuário" /></div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && dashboard && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Visão Geral do Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Produtos", value: dashboard.totalProdutos },
              { title: "Vendas", value: dashboard.totalVendas },
              { title: "Clientes", value: dashboard.totalClientes },
              { title: "Fornecedores", value: dashboard.totalFornecedores },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="text-center p-4 shadow-md hover:-translate-y-1 transition">
                  <CardTitle className="text-lg font-semibold mb-2">{stat.title}</CardTitle>
                  <p className="text-3xl font-bold text-primary">{stat.value ?? "--"}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Módulos acessíveis */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Módulos Disponíveis</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {accessibleMenuItems.map((item, index) => {
            const Icon = iconMap[item.url] || Box;
            return (
              <motion.div
                key={item.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={item.url}>
                  <Card className="h-full transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
