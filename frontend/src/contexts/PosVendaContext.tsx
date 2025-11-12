
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { PosVenda, PosVendaContextType, PosVendaDashboardData, FollowUp } from '@/types/pos-venda';
import { api } from '@/lib/api'; // Supondo que você tenha um arquivo de configuração da API
import { useAuth } from './useAuth';
import { useEmpresa } from './EmpresaContext';

const PosVendaContext = createContext<PosVendaContextType | undefined>(undefined);

export const PosVendaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posVendas, setPosVendas] = useState<PosVenda[]>([]);
  const [dashboardData, setDashboardData] = useState<PosVendaDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { empresaSelecionada } = useEmpresa();

  const handleApiError = (err: any, message: string) => {
    console.error(message, err);
    setError(err);
    toast.error(message, {
      description: err.response?.data?.message || err.message,
    });
  };

  const getAuthHeaders = useCallback(() => {
    if (!empresaSelecionada) {
        toast.error('Nenhuma empresa selecionada.');
        throw new Error('Nenhuma empresa selecionada.');
    }
    return {
        'empresa-id': empresaSelecionada.id,
    };
  }, [empresaSelecionada]);

  const fetchPosVendas = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/pos-venda', { params: filters, headers });
      setPosVendas(response.data);
    } catch (err) {
      handleApiError(err, 'Erro ao buscar acompanhamentos de pós-venda.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await api.get('/pos-venda/dashboard', { headers });
      setDashboardData(response.data);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const findUniquePosVenda = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await api.get(`/pos-venda/${id}`, { headers });
      return response.data;
    } catch (err) {
      handleApiError(err, 'Erro ao buscar detalhes do acompanhamento.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const createPosVenda = useCallback(async (data: Partial<PosVenda>) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await api.post('/pos-venda', data, { headers });
      toast.success('Acompanhamento de pós-venda criado com sucesso!');
      fetchPosVendas(); // Atualiza a lista
      return response.data;
    } catch (err) {
      handleApiError(err, 'Erro ao criar acompanhamento.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, fetchPosVendas]);

  const updatePosVenda = useCallback(async (id: string, data: Partial<PosVenda>) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const response = await api.put(`/pos-venda/${id}`, data, { headers });
      toast.success('Acompanhamento atualizado com sucesso!');
      // Atualiza o estado local para refletir a mudança imediatamente
      setPosVendas(prev => prev.map(pv => pv.id === id ? { ...pv, ...response.data } : pv));
      return response.data;
    } catch (err) {
      handleApiError(err, 'Erro ao atualizar acompanhamento.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const agendarFollowUp = useCallback(async (posVendaId: string, followUpData: Omit<FollowUp, "id" | "responsavel">) => {
    setLoading(true);
    setError(null);
    try {
        const headers = getAuthHeaders();
        const response = await api.post(`/pos-venda/${posVendaId}/follow-up`, followUpData, { headers });
        toast.success('Follow-up agendado com sucesso!');
        // Idealmente, o backend retorna o acompanhamento atualizado
        // ou você busca novamente os detalhes
        return response.data;
    } catch (err) {
        handleApiError(err, 'Erro ao agendar follow-up.');
        return null;
    } finally {
        setLoading(false);
    }
  }, [getAuthHeaders]);

  const finalizarAtendimento = useCallback(async (posVendaId: string) => {
    setLoading(true);
    setError(null);
    try {
        const headers = getAuthHeaders();
        await api.patch(`/pos-venda/${posVendaId}/finalizar`, {}, { headers });
        toast.success('Atendimento finalizado com sucesso!');
        setPosVendas(prev => prev.map(pv => pv.id === posVendaId ? { ...pv, status: 'finalizado' } : pv));
    } catch (err) {
        handleApiError(err, 'Erro ao finalizar atendimento.');
    } finally {
        setLoading(false);
    }
  }, [getAuthHeaders]);

  const enviarPesquisa = useCallback(async (posVendaId: string) => {
    setLoading(true);
    setError(null);
    try {
        const headers = getAuthHeaders();
        await api.post(`/pos-venda/${posVendaId}/enviar-pesquisa`, {}, { headers });
        toast.success('Pesquisa de satisfação enviada para o cliente!');
    } catch (err) {
        handleApiError(err, 'Erro ao enviar pesquisa.');
    } finally {
        setLoading(false);
    }
  }, [getAuthHeaders]);


  return (
    <PosVendaContext.Provider value={{
      posVendas,
      dashboardData,
      loading,
      error,
      fetchPosVendas,
      fetchDashboard,
      findUniquePosVenda,
      createPosVenda,
      updatePosVenda,
      agendarFollowUp,
      finalizarAtendimento,
      enviarPesquisa
    }}>
      {children}
    </PosVendaContext.Provider>
  );
};

export const usePosVenda = (): PosVendaContextType => {
  const context = useContext(PosVendaContext);
  if (context === undefined) {
    throw new Error('usePosVenda must be used within a PosVendaProvider');
  }
  return context;
};
