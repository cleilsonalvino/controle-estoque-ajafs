import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  ShoppingBag,
  TrendingUp,
  Activity,
  Server,
  AlertTriangle,
  Cpu,
  Globe2,
  Database,
  CreditCard,
  UserCircle2,
  ClipboardList,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Box,
  FileText,
  Clock,
} from "lucide-react";

import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useEmpresa } from "@/contexts/EmpresaContext";


export default function SuperAdminConsole() {
  const { empresas, dashboard, fetchEmpresas, fetchDashboard, loading, loadingList } =
    useEmpresa();

  useEffect(() => {
    fetchEmpresas();
    fetchDashboard();
  }, []);

  const statusApi = dashboard?.apiStatus ?? "OK";

  const vendasMensais = dashboard?.vendasMensais ?? [];
  const vendasPorFormaPagamento = dashboard?.vendasPorFormaPagamento ?? [];
  const fluxoCaixaMensal = dashboard?.fluxoCaixaMensal ?? [];
  const vendasPorEmpresaMesAtual = dashboard?.vendasPorEmpresaMesAtual ?? [];
  const ordensPorStatus = dashboard?.ordensServicoPorStatus ?? [];
  const posVendaPorStatus = dashboard?.posVendaPorStatus ?? [];
  const atividadesRecentes = dashboard?.atividadesRecentes ?? [];

  return (
    <div className="container mx-auto dark:bg-slate-900">
      
      {/* TOPO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-20 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Server className="h-9 w-9 text-blue-600" />
            Console global do sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Visao consolidada de todas as empresas, vendas, financeiro, clientes, servicos e infraestrutura.
          </p>
        </div>

        {/* Navegacao interna tipo console */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Button asChild variant="outline" size="sm">
            <a href="#visao-geral">Visao geral</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#empresas-usuarios">Empresas e usuarios</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#produtos-estoque">Produtos e estoque</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#vendas">Vendas</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#financeiro">Financeiro</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#clientes">Clientes</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#servicos-os">Servicos e ordens</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#pos-venda">Pos venda</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#movimentacoes">Movimentacoes</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#infra">Infraestrutura</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="#atividades">Atividades</a>
          </Button>
        </div>
      </motion.div>

      {/* ======================================================
         1) VISAO GERAL
      ====================================================== */}
      <section id="visao-geral" className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          Visao geral
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboard?.totalEmpresas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Matriz do sistema multiempresa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboard?.totalUsuarios ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Administradores, vendedores e usuarios operacionais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboard?.totalProdutos ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Itens cadastrados em todas as empresas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Vendas totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboard?.totalVendas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Vendas registradas no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================================================
         2) EMPRESAS E USUARIOS
      ====================================================== */}
      <section id="empresas-usuarios" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-blue-600" />
          Empresas e usuarios
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ranking de empresas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Empresas com maior volume de vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-100 text-left">
                    <th className="p-2">Pos</th>
                    <th className="p-2">Empresa</th>
                    <th className="p-2">Cidade</th>
                    <th className="p-2 text-right">Total vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard?.topEmpresas?.map((e, i) => (
                    <tr
                      key={e.id}
                      className="border-b hover:bg-slate-50 transition"
                    >
                      <td className="p-2 font-semibold">{i + 1}</td>
                      <td className="p-2">{e.nome}</td>
                      <td className="p-2">{e.cidade}</td>
                      <td className="p-2 text-right">
                        R{"$ "}
                        {e.totalVendas}
                      </td>
                    </tr>
                  ))}

                  {(!dashboard?.topEmpresas || dashboard.topEmpresas.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-muted-foreground">
                        Sem dados de ranking disponiveis
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Usuarios por papel */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuicao de usuarios por papel</CardTitle>
            </CardHeader>
            <CardContent>
              {(dashboard?.usuariosPorPapel?.length ?? 0) > 0 ? (
                <ul className="space-y-2 text-sm">
                  {dashboard!.usuariosPorPapel!.map((u) => (
                    <li key={u.papel} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <UserCircle2 className="w-4 h-4 text-slate-600" />
                        {u.papel}
                      </span>
                      <span className="font-semibold">{u.total}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Em breve distribuicao por papel disponivel no painel
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista rapida de empresas */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Empresas cadastradas no sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <p className="text-sm text-muted-foreground">Carregando empresas...</p>
            ) : empresas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
            ) : (
              <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
                {empresas.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="border rounded-lg p-3 text-xs md:text-sm bg-white dark:bg-slate-900/60"
                  >
                    <p className="font-semibold text-primary">{empresa.nome_fantasia}</p>
                    <p className="text-muted-foreground truncate">{empresa.cnpj}</p>
                    <p className="mt-1 truncate">
                      {empresa.cidade} {empresa.estado && `(${empresa.estado})`}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Criada em{" "}
                      {new Date(empresa.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      

      {/* ======================================================
         3) PRODUTOS E ESTOQUE
      ====================================================== */}
      <section id="produtos-estoque" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Box className="w-5 h-5 text-emerald-600" />
          Produtos e estoque
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total de produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.totalProdutos ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Somatorio de todas as empresas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Produtos em estoque critico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.estoqueCritico ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Abaixo do estoque minimo configurado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lotes proximos da validade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.lotesProximosVencimento ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Monitorar para evitar perda de estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Movimentacoes hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.movimentacoesEstoqueHoje ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Entradas, saidas e ajustes de estoque
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================================================
         4) VENDAS
      ====================================================== */}
      <section id="vendas" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-amber-600" />
          Vendas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vendas hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.vendasHoje ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Considerando todas as empresas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vendas ultimos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.vendasUltimos7Dias ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Indicador de ritmo de operacao
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket medio global</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R{"$ "}
                {(dashboard?.ticketMedioGeral ?? 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                Todas as empresas consolidadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Formas de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              {vendasPorFormaPagamento.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Sem dados consolidados de formas de pagamento
                </p>
              ) : (
                <div className="space-y-1 text-xs">
                  {vendasPorFormaPagamento.map((f) => (
                    <div key={f.forma} className="flex justify-between">
                      <span>{f.forma}</span>
                      <span className="font-semibold">
                        R{"$ "}
                        {f.total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
          {/* Vendas mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo mensal de vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={vendasMensais}>
                  <defs>
                    <linearGradient id="vendasArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fill="url(#vendasArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vendas por empresa no mes atual */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por empresa no mes atual</CardTitle>
            </CardHeader>
            <CardContent>
              {vendasPorEmpresaMesAtual.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem dados consolidados de empresas no mes atual
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={vendasPorEmpresaMesAtual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="empresaNome" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================================================
         5) FINANCEIRO
      ====================================================== */}
      <section id="financeiro" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-700" />
          Financeiro consolidado
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Saldo consolidado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold flex items-center gap-1">
                R{"$ "}
                {(dashboard?.saldoFinanceiroGlobal ?? 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
                {dashboard &&
                  (dashboard.saldoFinanceiroGlobal ?? 0) >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
              </p>
              <p className="text-xs text-muted-foreground">
                Soma de contas bancarias de todas as empresas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contas a pagar abertas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.totalContasPagarAbertas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Titulo em aberto no sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contas a receber abertas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.totalContasReceberAbertas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Recebiveis ainda nao liquidados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contas atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-1">
                Pagar
              </p>
              <p className="text-lg font-semibold mb-3">
                R{"$ "}
                {(dashboard?.valorContasPagarAtrasadas ?? 0).toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 }
                )}
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                Receber com vencimento proximo
              </p>
              <p className="text-lg font-semibold">
                R{"$ "}
                {(dashboard?.valorContasReceberVencendo ?? 0).toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 }
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Fluxo de caixa mensal consolidado</CardTitle>
          </CardHeader>
          <CardContent>
            {fluxoCaixaMensal.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Fluxo de caixa ainda nao foi consolidado para exibicao
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={fluxoCaixaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="competencia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entradas" stackId="a" fill="#22c55e" />
                  <Bar dataKey="saidas" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
         6) CLIENTES
      ====================================================== */}
      <section id="clientes" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <UserCircle2 className="w-5 h-5 text-sky-600" />
          Clientes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total de clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.totalClientes ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Base de clientes em todas as empresas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Clientes novos nos ultimos 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.clientesNovosUltimos30Dias ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Crescimento recente da base
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clientes com maior volume de compras</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.topClientes && dashboard.topClientes.length > 0 ? (
              <table className="w-full text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-100 text-left">
                    <th className="p-2">Cliente</th>
                    <th className="p-2 text-right">Total comprado</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.topClientes.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">{c.nome}</td>
                      <td className="p-2 text-right">
                        R{"$ "}
                        {c.totalComprado.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ranking de clientes ainda nao disponivel
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
         7) SERVICOS E ORDENS DE SERVICO
      ====================================================== */}
      <section id="servicos-os" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-violet-600" />
          Servicos e ordens de servico
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ordens de servico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.totalOrdensServico ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Todas as empresas consolidadas
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">
                Distribuicao por status de ordem de servico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordensPorStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda nao ha dados consolidados de ordens de servico
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                  {ordensPorStatus.map((os) => (
                    <div
                      key={os.status}
                      className="flex items-center justify-between border rounded-lg px 3 py-2 bg-white dark:bg-slate-900/60"
                    >
                      <span>{os.status}</span>
                      <span className="font-semibold">{os.quantidade}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================================================
         8) POS VENDA
      ====================================================== */}
      <section id="pos-venda" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-rose-600" />
          Pos venda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Interacoes de pos venda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.totalPosVendas ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Contatos pos venda realizados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Satisfacao media</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(dashboard?.satisfacaoMedia ?? 0).toFixed(1)}
                <span className="text-sm text-muted-foreground"> / 10</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Baseada em feedbacks registrados
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status das atividades de pos venda</CardTitle>
          </CardHeader>
          <CardContent>
            {posVendaPorStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda nao ha dados consolidados de pos venda
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                {posVendaPorStatus.map((p) => (
                  <div
                    key={p.status}
                    className="border rounded-lg px 3 py-2 flex items-center justify-between bg-white dark:bg-slate-900/60"
                  >
                    <span>{p.status}</span>
                    <span className="font-semibold">{p.quantidade}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
         9) MOVIMENTACOES
      ====================================================== */}
      <section id="movimentacoes" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700" />
          Movimentacoes de estoque e financeiro
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Resumo operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este painel pode ser expandido para incluir logs detalhados de movimentacao de estoque,
              movimentacoes financeiras e trilha de auditoria por usuario. No backend basta consolidar
              estes dados e incluir na resposta do dashboard.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ======================================================
         11) INFRAESTRUTURA
      ====================================================== */}
      <section id="infra" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600" />
          Infraestrutura e saude do sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status da API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    statusApi === "OK"
                      ? "bg-emerald-500"
                      : statusApi === "INSTAVEL"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="font-semibold text-sm">{statusApi}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Status geral reportado pelo backend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latencia media</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold flex items-center gap-1">
                {dashboard?.apiLatenciaMediaMs ?? 0}
                <span className="text-xs text-muted-foreground">ms</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Media das principais rotas do sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Requisicoes nas ultimas 24 horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dashboard?.apiRequests24h ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Todas as empresas considerando trafego do dia
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Erros nas ultimas 24 horas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">
                {dashboard?.apiErros24h ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Ideal acompanhar para evoluir estabilidade
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ======================================================
         12) ATIVIDADES RECENTES
      ====================================================== */}
      <section id="atividades" className="mt-10 space-y-4 mb-10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Atividades recentes
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Eventos recentes no sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {atividadesRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda nao ha feed consolidado de atividades. No backend basta registrar eventos relevantes
                (criar empresa, vender, criar ordem de servico, etc) e retornar aqui.
              </p>
            ) : (
              <ul className="space-y-2 text-xs md:text-sm">
                {atividadesRecentes.map((a) => (
                  <li
                    key={a.id}
                    className="border-b pb-2 last:border-0 flex justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold">{a.tipo}</p>
                      <p className="text-muted-foreground">
                        {a.descricao}
                        {a.empresaNome ? ` | Empresa: ${a.empresaNome}` : " - sem nome"}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(a.data).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
