import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { allMenuItems } from "@/config/menuItems";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
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
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    if (user?.papel === "ADMINISTRADOR") {
      api.get("/dashboard")
        .then((res) => setDashboard(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!user) return <div>Carregando informações do usuário...</div>;

  const isAdmin = user.papel?.toLowerCase() === "administrador";

  const accessibleMenuItems = isAdmin
    ? allMenuItems.filter((item) => item.url !== "/")
    : allMenuItems.filter(
        (item) => item.url !== "/" && user.telasPermitidas?.includes(item.url)
      );

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Cabeçalho com informações do usuário */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          Bem-vindo(a), {user.nome.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground capitalize">
          {user.papel.toLowerCase()}
        </p>
      </motion.div>

      {/* Dados do usuário */}
      <Card className="max-w-2xl shadow-md">
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Nome:</strong>
            <p>{user.nome}</p>
          </div>
          <div>
            <strong>Email:</strong>
            <p>{user.email}</p>
          </div>
          <div>
            <strong>Status:</strong>
            <p>{user.ativo ? "Ativo" : "Inativo"}</p>
          </div>
          <div>
            <strong>Criado em:</strong>
            <p>{new Date(user.criadoEm).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Se for ADMIN, visão geral do sistema */}
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
