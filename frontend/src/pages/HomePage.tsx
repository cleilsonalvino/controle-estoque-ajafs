// src/pages/HomePage.tsx

import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { allMenuItems } from "@/config/menuItems";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
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
import api from "@/lib/api";
import { useEmpresa } from "@/contexts/EmpresaContext"; // ✅ NOVO: Importar o hook da empresa
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
  // ✅ CORREÇÃO: Pegar apenas a função do context
  const { findUniqueEmpresa } = useEmpresa();
  const [dashboard, setDashboard] = useState<any>(null);

  // ✅ CORREÇÃO: Vamos usar 'empresaDados' para guardar os dados
  const [empresaDados, setEmpresaDados] = useState<any>(null);
  // ✅ CORREÇÃO: Criar um estado de loading local
  const [loadingEmpresaData, setLoadingEmpresaData] = useState(false);

  useEffect(() => {
    // 1. Lógica do Dashboard (como estava antes)
    if (user?.user.papel === "ADMINISTRADOR") {
      api
        .get("/dashboard")
        .then((res) => setDashboard(res.data))
        .catch((err) => console.error("Erro ao buscar dashboard:", err));
    }

    console.log("user:", user);

    // 2. Criar uma função async interna para buscar dados da empresa
    const fetchEmpresaData = async () => {
      // ✅ FIX 1: A "Guarda"
      // Só executa se o user e o empresaId existirem
      if (!user || !user.user.empresa.id) {
        return; // Sai da função se o usuário ou o ID não estiverem prontos
      }

      setLoadingEmpresaData(true);

      // ✅ FIX 2: O 'try/catch' e 'await' corretos
      try {
        const data = await findUniqueEmpresa(user.user.empresa.id);
        setEmpresaDados(data);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        toast.error("Erro ao buscar dados da empresa");
      } finally {
        setLoadingEmpresaData(false);
      }
    };

    // 3. Chamar a função async interna
    fetchEmpresaData();
  }, [user, findUniqueEmpresa]); // Dependências corretas

  if (!user) return <div>Carregando informações do usuário...</div>;

  const email = user.user.email?.toLowerCase();
  const isAdmin = user.user.papel?.toLowerCase() === "administrador";
  const isMaster = email === "ajafs@admin.com";

  const accessibleMenuItems = useMemo(() => {
    // 🔹 Caso seja o superadmin master, exibe tudo exceto a home
    if (isMaster) {
      return allMenuItems.filter((item) => item.url !== "/");
    }

    // 🔹 Caso seja admin, exibe tudo exceto o super_admin e a home
    if (isAdmin) {
      return allMenuItems.filter(
        (item) => item.url !== "/" && item.key !== "super_admin"
      );
    }

    // 🔹 Caso comum, filtra apenas telas permitidas e oculta super_admin
    return allMenuItems.filter(
      (item) =>
        item.url !== "/" &&
        item.key !== "super_admin" &&
        user.user.telasPermitidas?.includes(item.url)
    );
  }, [isAdmin, isMaster, user]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Cabeçalho com informações do usuário */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-row items-center space-y-2 justify-between"
      >
        <h1 className="text-3xl font-bold">
          Bem-vindo(a), {user.user.nome}!
          <p className="text-muted-foreground capitalize text-sm font-normal">
            {user.user.papel?.toUpperCase()}(A)
          </p>
        </h1>
        {isMaster && (
          <span className="ml-2 text-xs px-2 py-1 rounded bg-primary text-primary-foreground uppercase">
            Acesso Master
          </span>
        )}

        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4PmLASrRCL1jyqcfM1e96WSV2H7cO63HMTQ&s"
          alt="logo da empresa"
          className="p-2 w-28 cursor-pointer"
        />
      </motion.div>

      {/* 🔄 ALTERADO: Cards de Informações */}
      <div className="flex flex-wrap gap-4">
        {/* Card 1: Informações da Empresa (do useEmpresa) */}
        <Card className="flex-1 min-w-[350px] max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            {/* ✅ CORREÇÃO: Usar o estado de loading local */}
            {loadingEmpresaData ? (
              <p>Carregando dados da empresa...</p>
            ) : // ✅ CORREÇÃO: Usar o estado 'empresaDados'
            empresaDados ? (
              <>
                <div>
                  <strong>Razão Social:</strong>
                  {/* ✅ CORREÇÃO: Ler de 'empresaDados' */}
                  <p>{empresaDados.razaoSocial}</p>
                </div>
                <div>
                  <strong>Nome Fantasia:</strong>
                  <p>{empresaDados.nomeFantasia}</p>
                </div>
                <div>
                  <strong>CNPJ:</strong>
                  <p>{empresaDados.cnpj}</p>
                </div>
                <div>
                  <strong>Telefone:</strong>
                  <p>{empresaDados.telefone}</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>{empresaDados.email ?? "--"}</p>
                </div>
                <div>
                  <strong>Cidade/Estado:</strong>
                  <p>
                    {empresaDados.cidade} / {empresaDados.estado}
                  </p>
                </div>
              </>
            ) : (
              <p>Nenhuma informação da empresa cadastrada.</p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Informações do Perfil (do useAuth) */}
        <Card className="flex-1 min-w-[350px] max-w-2xl shadow-md">
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Nome:</strong>
              <p>{user.user.nome}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>{user.user.email}</p>
            </div>
            <div>
              <strong>Status:</strong>
              {/* ✅ CORREÇÃO: Lógica de status estava invertida */}
              <p>Ativo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Se for ADMIN, visão geral do sistema */}
      {isAdmin && dashboard && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Visão Geral do Sistema
          </h2>
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
                  <CardTitle className="text-lg font-semibold mb-2">
                    {stat.title}
                  </CardTitle>
                  <p className="text-3xl font-bold text-primary">
                    {stat.value ?? "--"}
                  </p>
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
                      <CardTitle className="text-sm font-medium">
                        {item.title}
                      </CardTitle>
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
