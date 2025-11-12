import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "./ui/card";
import {api} from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];


const StockTurnoverChart = () => {
  const [data, setData] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      try {
        const response = await api.get("/estoque/movimentacoes");
        setMovimentacoes(response.data);
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovimentacoes();
  }, []);

  // 🧠 Cálculo do giro filtrado por mês/ano
  const dadosFiltrados = useMemo(() => {
    if (!movimentacoes.length) return [];

    const inicioMes = new Date(anoSelecionado, mesSelecionado, 1);
    const fimMes = new Date(anoSelecionado, mesSelecionado + 1, 0);

    const filtradas = movimentacoes.filter((m) => {
      const dataMov = new Date(m.criadoEm);
      return dataMov >= inicioMes && dataMov <= fimMes;
    });

    const agrupado = filtradas.reduce((acc, mov) => {
      const nome = mov.produto?.nome || "Produto Desconhecido";
      const qtd = Number(mov.quantidade);
      if (!acc[nome]) acc[nome] = { entradas: 0, saidas: 0, historico: [] };
      if (mov.tipo === "ENTRADA") acc[nome].entradas += qtd;
      if (mov.tipo === "SAIDA") acc[nome].saidas += qtd;
      acc[nome].historico.push({
        data: new Date(mov.criadoEm),
        quantidade: qtd,
        tipo: mov.tipo,
      });
      return acc;
    }, {});

    const calculado = Object.entries(agrupado).map(([nome, dados]: [string, { entradas: number; saidas: number; historico: any[] }]) => {
      const { entradas, saidas, historico } = dados;
      historico.sort((a, b) => a.data - b.data);

      let soma = 0;
      for (let i = 0; i < historico.length - 1; i++) {
        const estIni =
          historico[i].tipo === "ENTRADA"
            ? historico[i].quantidade
            : -historico[i].quantidade;
        const estFim =
          historico[i + 1].tipo === "ENTRADA"
            ? historico[i + 1].quantidade
            : -historico[i + 1].quantidade;
        soma += (estIni + estFim) / 2;
      }

      const estoqueMedio =
        historico.length > 1 ? soma / (historico.length - 1) : entradas || 1;
      const giro = estoqueMedio > 0 ? saidas / estoqueMedio : 0;

      return {
        nome,
        giro: Number(giro.toFixed(2)),
        estoqueMedio: Number(estoqueMedio.toFixed(2)),
        entradas,
        saidas,
      };
    });

    return calculado;
  }, [movimentacoes, mesSelecionado, anoSelecionado]);

  useEffect(() => {
    setData(dadosFiltrados);
  }, [dadosFiltrados]);

  // 📆 Selecionar ano dinamicamente (últimos 5 anos)
  const anosDisponiveis = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Card title="Giro de Estoque">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row justify-end gap-2 mb-4">
        <Select
          value={String(mesSelecionado)}
          onValueChange={(v) => setMesSelecionado(Number(v))}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {meses.map((m, i) => (
              <SelectItem key={i} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(anoSelecionado)}
          onValueChange={(v) => setAnoSelecionado(Number(v))}
        >
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anosDisponiveis.map((ano) => (
              <SelectItem key={ano} value={String(ano)}>
                {ano}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center items-center h-[250px] text-muted-foreground">
          <Loader2 className="animate-spin h-6 w-6 mr-2" />
          Carregando dados...
        </div>
      ) : data.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          Nenhuma movimentação encontrada para o período selecionado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-white shadow p-2 rounded text-sm">
                    <p><strong>{p.nome}</strong></p>
                    <p>Giro: {p.giro}x</p>
                    <p>Entradas: {p.entradas}</p>
                    <p>Saídas: {p.saidas}</p>
                    <p>Estoque médio: {p.estoqueMedio}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="giro" fill="#22c55e" name="Giro de Estoque" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default StockTurnoverChart;
