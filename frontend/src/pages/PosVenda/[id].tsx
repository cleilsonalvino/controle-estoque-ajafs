
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePosVenda } from '@/contexts/PosVendaContext';
import { PosVenda as PosVendaType } from '@/types/pos-venda';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Mail, Phone, User, ShoppingCart, DollarSign, Star, MessageSquare, PlusCircle, CheckCircle, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Placeholder for modal - to be created later
import { AgendarFollowUpModal } from '@/components/pos-venda/AgendarFollowUpModal';

export default function PosVendaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { findUniquePosVenda, loading, updatePosVenda } = usePosVenda();
  const [posVenda, setPosVenda] = useState<PosVendaType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickNote, setQuickNote] = useState('');

  useEffect(() => {
    if (id) {
      findUniquePosVenda(id).then(data => {
        setPosVenda(data);
        setQuickNote(data?.anotacoes || '');
      });
    }
  }, [id, findUniquePosVenda]);

  // Auto-save quick note
  useEffect(() => {
    const handler = setTimeout(() => {
      if (id && quickNote !== posVenda?.anotacoes) {
        updatePosVenda(id, { anotacoes: quickNote });
      }
    }, 1500); // Save after 1.5s of inactivity

    return () => {
      clearTimeout(handler);
    };
  }, [quickNote, id, posVenda, updatePosVenda]);

  if (loading || !posVenda) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-80 w-full lg:col-span-2" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const { cliente, venda, historicoContatos, feedback, status } = posVenda;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Detalhes do Pós-Venda</h1>
            <p className="text-muted-foreground">Acompanhamento de {cliente.nome}</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Agendar Follow-Up</Button>
            <Button variant="outline"><CheckCircle className="mr-2 h-4 w-4" /> Finalizar Atendimento</Button>
            <Button variant="secondary"><Send className="mr-2 h-4 w-4" /> Enviar Pesquisa</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-2" /> Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nome:</strong> {cliente.nome}</p>
            <p><strong><Phone className="inline mr-2 h-4 w-4" /></strong> {cliente.telefone}</p>
            <p><strong><Mail className="inline mr-2 h-4 w-4" /></strong> {cliente.email}</p>
            <p><strong>Cidade:</strong> {cliente.cidade}</p>
          </CardContent>
        </Card>

        {/* Card da Venda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingCart className="mr-2" /> Dados da Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Data:</strong> {new Date(venda.dataVenda).toLocaleDateString()}</p>
            <p><strong><DollarSign className="inline mr-2 h-4 w-4" /></strong> {venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p className="font-semibold">Produtos:</p>
            <ul className="list-disc pl-5 text-sm">
              {venda.produtos.map(p => <li key={p.id}>{p.nome} (x{p.quantidade})</li>)}
            </ul>
          </CardContent>
        </Card>

        {/* Card de Satisfação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Star className="mr-2" /> Satisfação do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`h-6 w-6 ${i < feedback.nota ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <p className="text-muted-foreground italic">"{feedback.comentario || 'Nenhum comentário fornecido.'}"</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum feedback recebido ainda.</p>
            )}
          </CardContent>
        </Card>

        {/* Histórico e Anotações */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico e Anotações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">Anotação Rápida (salva automaticamente)</h3>
                <Textarea 
                    placeholder="Digite suas anotações aqui..."
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    className="h-24"
                />
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold">Histórico de Contatos</h3>
                <div className="space-y-3 mt-2">
                    {historicoContatos.length > 0 ? historicoContatos.map(h => (
                        <div key={h.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0"><Calendar className="h-5 w-5 text-muted-foreground" /></div>
                            <div>
                                <p className="font-medium">{new Date(h.dataContato).toLocaleString()} - <Badge variant="secondary">{h.tipoContato}</Badge></p>
                                <p className="text-sm text-muted-foreground">{h.observacao}</p>
                                <p className="text-xs text-gray-500">por {h.responsavel.nome}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">Nenhum contato registrado.</p>}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AgendarFollowUpModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} posVendaId={id!} />
    </div>
  );
}
