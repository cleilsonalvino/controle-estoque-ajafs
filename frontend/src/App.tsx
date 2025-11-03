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
import Settings from "./pages/Settings";
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
import SuperAdminEmpresas from "./pages/admin/SuperAdmin";
import { ServiceSalesProvider } from "./contexts/ServiceSalesContext";
//import { TitleBar } from "./components/TitleBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <EmpresaProvider>
            <SalesProvider>
              <ServiceSalesProvider>
                <SupplierProvider>
                  <CategoryProvider>
                    <ServiceCategoryProvider>
                      <ProdutoProvider>
                        <ClienteProvider>
                          <VendedorProvider>
                            <TipoServicoProvider>
                              <Routes>
                                <Route path="/login" element={<LoginPage />} />

                                {/* Routes protected by authentication */}
                                <Route element={<ProtectedRoute />}>
                                  {/* === GROUP 1: Routes WITH Sidebar === */}
                                  <Route path="/" element={<Layout />}>
                                    <Route index element={<HomePage />} />
                                    <Route
                                      path="/estoque"
                                      element={
                                        <PermissionGuard permissionKey="estoque">
                                          <EstoqueDashboard />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      index
                                      element={
                                        <PermissionGuard permissionKey="admin">
                                          <SuperAdminEmpresas />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/products"
                                      element={
                                        <PermissionGuard permissionKey="products">
                                          <Products />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/movements"
                                      element={
                                        <PermissionGuard permissionKey="movements">
                                          <Movements />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/suppliers"
                                      element={
                                        <PermissionGuard permissionKey="suppliers">
                                          <Suppliers />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/categories"
                                      element={
                                        <PermissionGuard permissionKey="categories">
                                          <Categories />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/service-categories"
                                      element={
                                        <PermissionGuard permissionKey="service-categories">
                                          <ServiceCategories />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/tipos-servicos"
                                      element={
                                        <PermissionGuard permissionKey="tipos-servicos">
                                          <TiposServicos />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/dashboard-sales"
                                      element={
                                        <PermissionGuard permissionKey="dashboard-sales">
                                          <SalesDashboard />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/clientes"
                                      element={
                                        <PermissionGuard permissionKey="clientes">
                                          <Clientes />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/vendedores"
                                      element={
                                        <PermissionGuard permissionKey="vendedores">
                                          <Vendedores />
                                        </PermissionGuard>
                                      }
                                    />
                                    <Route
                                      path="/settings"
                                      element={
                                        <PermissionGuard permissionKey="settings">
                                          <Settings />
                                        </PermissionGuard>
                                      }
                                    />
                                  </Route>

                                  {/* === GROUP 2: Route WITHOUT Sidebar (PDV) === */}
                                  <Route
                                    path="/sales"
                                    element={
                                      <PermissionGuard permissionKey="sales">
                                        <Sales />
                                      </PermissionGuard>
                                    }
                                  />
                                </Route>

                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </TipoServicoProvider>
                          </VendedorProvider>
                        </ClienteProvider>
                      </ProdutoProvider>
                    </ServiceCategoryProvider>
                  </CategoryProvider>
                </SupplierProvider>
              </ServiceSalesProvider>
            </SalesProvider>
          </EmpresaProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
