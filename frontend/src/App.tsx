import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HomePage } from "./pages/HomePage";
//import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Movements from "./pages/Movements";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import ServiceCategories from "./pages/ServiceCategories";
import Settings from "./pages/settings/index";
import Sales from "./pages/Sales";
import SalesDashboard from "./pages/SalesDashboard";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "./contexts/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProdutoProvider } from "@/contexts/ProdutoContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { ServiceCategoryProvider } from "@/contexts/ServiceCategoryContext";
import { SupplierProvider } from "@/contexts/SupplierContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ClienteProvider } from "./contexts/ClienteContext";
import { VendedorProvider } from "./contexts/VendedorContext";
import { TipoServicoProvider } from "./contexts/TiposServicosContext";
import { EmpresaProvider } from "./contexts/EmpresaContext";
import Clientes from "./pages/Clientes";
import Vendedores from "./pages/Vendedores";
import TiposServicos from "./pages/TiposServicos";
import EstoqueDashboard from "./pages/EstoqueDashboard";
import { PermissionGuard } from "./components/PermissionGuard";
import SuperAdminEmpresas from "./pages/admin/SuperAdminEmpresas";
import { ServiceSalesProvider } from "./contexts/ServiceSalesContext";
import { PosVendaProvider } from "./contexts/PosVendaContext";
import PosVenda from "./pages/PosVenda/index";
import PosVendaDetalhes from "./pages/PosVenda/[id]";
import PosVendaDashboard from "./pages/PosVenda/PosVendaDashboard";
import FeedbackPage from "./pages/Feedback/[id]";
//import { TitleBar } from "./components/TitleBar";

const queryClient = new QueryClient();

import { UsersProvider } from "./contexts/UsersContext";

import { FinanceiroProvider } from "./contexts/FinanceiroContext";
import FinanceiroDashboard from "./pages/Financeiro/Dashboard";
import Movimentacoes from "./pages/Financeiro/Movimentacoes";
import ContasPagar from "./pages/Financeiro/ContasPagar";
import ContasReceber from "./pages/Financeiro/ContasReceber";
import ContasBancarias from "./pages/Financeiro/ContasBancarias";
import CategoriasFinanceiras from "./pages/Financeiro/Categorias";
import RelatoriosFinanceiros from "./pages/Financeiro/Relatorios";

import { OrdemDeServicoProvider } from "./contexts/OrdemDeServicoContext";

import OrdemDeServicoPage from "./pages/OrdemDeServico";
import CreateEmpresaPage from "./pages/admin/CreateEmpresa";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <UsersProvider>
            <EmpresaProvider>
              <PosVendaProvider>
                <SalesProvider>
                  <ServiceSalesProvider>
                    <SupplierProvider>
                      <CategoryProvider>
                        <ServiceCategoryProvider>
                          <ProdutoProvider>
                            <ClienteProvider>
                              <VendedorProvider>
                                <TipoServicoProvider>
                                  <FinanceiroProvider>
                                    <OrdemDeServicoProvider>
                                      <Routes>
                                        <Route
                                          path="/login"
                                          element={<LoginPage />}
                                        />
                                        <Route
                                          path="/feedback/:id"
                                          element={<FeedbackPage />}
                                        />

                                        {/* Routes protected by authentication */}
                                        <Route element={<ProtectedRoute />}>
                                          {/* === GROUP 1: Routes WITH Sidebar === */}
                                          <Route path="/" element={<Layout />}>
                                            <Route
                                              index
                                              element={<HomePage />}
                                            />
                                            <Route
                                              path="estoque"
                                              element={
                                                <PermissionGuard permissionKey="estoque">
                                                  <EstoqueDashboard />
                                                </PermissionGuard>
                                              }
                                            />

                                            <Route
                                              path="products"
                                              element={
                                                <PermissionGuard permissionKey="products">
                                                  <Products />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="pos-venda"
                                              element={
                                                <PermissionGuard permissionKey="pos-venda">
                                                  <PosVenda />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="pos-venda/:id"
                                              element={
                                                <PermissionGuard permissionKey="pos-venda.detalhes">
                                                  <PosVendaDetalhes />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="pos-venda/dashboard"
                                              element={
                                                <PermissionGuard permissionKey="pos-venda.dashboard">
                                                  <PosVendaDashboard />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="movements"
                                              element={
                                                <PermissionGuard permissionKey="movements">
                                                  <Movements />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="suppliers"
                                              element={
                                                <PermissionGuard permissionKey="suppliers">
                                                  <Suppliers />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="categories"
                                              element={
                                                <PermissionGuard permissionKey="categories">
                                                  <Categories />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="service-categories"
                                              element={
                                                <PermissionGuard permissionKey="service-categories">
                                                  <ServiceCategories />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="tipos-servicos"
                                              element={
                                                <PermissionGuard permissionKey="tipos-servicos">
                                                  <TiposServicos />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="ordens-de-servico"
                                              element={
                                                <PermissionGuard permissionKey="ordens-de-servico">
                                                  <OrdemDeServicoPage />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="dashboard-sales"
                                              element={
                                                <PermissionGuard permissionKey="dashboard-sales">
                                                  <SalesDashboard />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="clientes"
                                              element={
                                                <PermissionGuard permissionKey="clientes">
                                                  <Clientes />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="vendedores"
                                              element={
                                                <PermissionGuard permissionKey="vendedores">
                                                  <Vendedores />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="settings"
                                              element={
                                                <PermissionGuard permissionKey="settings">
                                                  <Settings />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="super-admin"
                                              element={
                                                <PermissionGuard permissionKey="super-admin">
                                                  <SuperAdminEmpresas />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="super-admin/criarEmpresa"
                                              element={
                                                <PermissionGuard permissionKey="super-admin">
                                                  <CreateEmpresaPage />
                                                </PermissionGuard>
                                              }
                                            />

                                            {/* Financeiro Routes */}
                                            <Route
                                              path="financeiro"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-dashboard">
                                                  <FinanceiroDashboard />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="financeiro/movimentacoes"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-movimentacoes">
                                                  <Movimentacoes />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="financeiro/contas-a-pagar"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-contas-pagar">
                                                  <ContasPagar />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="financeiro/contas-a-receber"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-contas-receber">
                                                  <ContasReceber />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="financeiro/contas-bancarias"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-contas-bancarias">
                                                  <ContasBancarias />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="financeiro/categorias"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-categorias">
                                                  <CategoriasFinanceiras />
                                                </PermissionGuard>
                                              }
                                            />
                                            <Route
                                              path="financeiro/relatorios"
                                              element={
                                                <PermissionGuard permissionKey="financeiro-relatorios">
                                                  <RelatoriosFinanceiros />
                                                </PermissionGuard>
                                              }
                                            />
                                          </Route>

                                          {/* === GROUP 2: Route WITHOUT Sidebar (PDV) === */}
                                          <Route
                                            path="sales"
                                            element={
                                              <PermissionGuard permissionKey="sales">
                                                <Sales />
                                              </PermissionGuard>
                                            }
                                          />
                                        </Route>

                                        <Route
                                          path="*"
                                          element={<NotFound />}
                                        />
                                      </Routes>
                                    </OrdemDeServicoProvider>
                                  </FinanceiroProvider>
                                </TipoServicoProvider>
                              </VendedorProvider>
                            </ClienteProvider>
                          </ProdutoProvider>
                        </ServiceCategoryProvider>
                      </CategoryProvider>
                    </SupplierProvider>
                  </ServiceSalesProvider>
                </SalesProvider>
              </PosVendaProvider>
            </EmpresaProvider>
          </UsersProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
