import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePosVenda } from "@/contexts/PosVendaContext";
import { PosVenda as PosVendaType } from "@/types/pos-venda";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Mail,
  Phone,
  User,
  ShoppingCart,
  DollarSign,
  Star,
  PlusCircle,
  CheckCircle,
  Send,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function PosVendaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { findUniquePosVenda, loading, updatePosVenda } = usePosVenda();

  const [posVenda, setPosVenda] = useState<PosVendaType | null>(null);
  const [quickNote, setQuickNote] = useState("");

  // Buscar dados
  useEffect(() => {
    if (!id) return;

    findUniquePosVenda(id).then((data) => {
      setPosVenda(data);
      setQuickNote(data?.observacoes || "");
    });
  }, [id, findUniquePosVenda]);

  // Auto-save observações → salvando em "observacoes"
  useEffect(() => {
    if (!id || !posVenda) return;

    const handler = setTimeout(() => {
      if (quickNote !== posVenda.observacoes) {
        updatePosVenda(id, { observacoes: quickNote });
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [quickNote, id, posVenda, updatePosVenda]);

  // Carregando
  if (loading || !posVenda) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { venda, cliente, usuario, followUps, feedbacks, status, satisfacao } =
    posVenda;

  const feedback = feedbacks.length > 0 ? feedbacks[0] : null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* TÍTULO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Pós-Venda</h1>
          <p className="text-muted-foreground">
            Acompanhamento do cliente{" "}
            {cliente?.nome ?? "(cliente não informado)"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agendar Follow-Up
          </Button>

          <Button variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
          </Button>

          <Button variant="secondary">
            <Send className="mr-2 h-4 w-4" />
            Enviar Pesquisa
          </Button>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD CLIENTE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2" /> Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Nome:</strong> {cliente?.nome ?? "Não informado"}
            </p>

            <p>
              <Phone className="inline mr-2 h-4 w-4" />
              {cliente?.telefone ?? "Sem telefone"}
            </p>

            <p>
              <Mail className="inline mr-2 h-4 w-4" />
              {cliente?.email ?? "Sem e-mail"}
            </p>
          </CardContent>
        </Card>

        {/* CARD VENDA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2" /> Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Número:</strong> {venda?.numero ?? "—"}
            </p>

            <p>
              <DollarSign className="inline mr-2 h-4 w-4" />
              Valor:{" "}
              {venda?.total
                ? Number(venda.total).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "—"}
            </p>

            <p>
              <strong>Vendedor:</strong>{" "}
              {venda?.vendedor?.nome ?? "Não informado"}
            </p>
          </CardContent>
        </Card>

        {/* CARD DE SATISFAÇÃO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2" /> Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedback ? (
              <>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < feedback.avaliacao
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="italic text-muted-foreground">
                  "{feedback.comentario ?? "Sem comentário"}"
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Nenhum feedback recebido ainda.
              </p>
            )}
          </CardContent>
        </Card>

        {/* HISTÓRICO + ANOTAÇÕES */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico e Anotações</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ANOTAÇÃO ➝ SALVA EM observacoes */}
            <div>
              <h3 className="font-semibold mb-2">
                Anotação Rápida (auto-save)
              </h3>
              <Textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="h-28"
                placeholder="Escreva observações..."
              />
            </div>

            <Separator />

            {/* FOLLOW-UPS */}
            <div>
              <h3 className="font-semibold">Histórico de Follow-Ups</h3>

              <div className="space-y-3 mt-3">
                {followUps.length > 0 ? (
                  followUps.map((f) => (
                    <div key={f.id} className="flex gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />

                      <div>
                        <p className="font-medium">
                          {new Date(f.dataAgendada).toLocaleString()} —
                          <Badge variant="secondary" className="ml-2">
                            {f.tipoAcao || "contato"}
                          </Badge>
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {f.observacao || "Sem observação"}
                        </p>

                        <p className="text-xs text-gray-500">
                          responsável: {f.responsavel?.nome ?? "—"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum follow-up registrado ainda.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
