import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

import {
  PosVenda,
  PosVendaContextType,
  PosVendaDashboardData
} from "@/types/pos-venda";

import { api } from "@/lib/api";
import { useAuth } from "./useAuth";
import { useEmpresa } from "./EmpresaContext";

import {
  CreatePosVenda,
  AgendarFollowUpData
} from "@/types/pos-venda-dto";

const PosVendaContext = createContext<PosVendaContextType | undefined>(undefined);

export const PosVendaProvider = ({ children }: { children: ReactNode }) => {

  const [posVendas, setPosVendas] = useState<PosVenda[]>([]);
  const [dashboardData, setDashboardData] = useState<PosVendaDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();
  const { empresa } = useEmpresa();

  // ---------------------------------------------------------
  // GET HEADERS
  // ---------------------------------------------------------
  const getAuthHeaders = useCallback(() => {
    if (!empresa) {
      toast.error("Nenhuma empresa selecionada.");
      throw new Error("Nenhuma empresa selecionada.");
    }
    return { "empresa-id": empresa.id };
  }, [empresa]);


  // ---------------------------------------------------------
  // UNIFICADOR DE ERROS
  // ---------------------------------------------------------
  const withApiHandling = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (err: any) {
      console.error(errorMessage, err);
      setError(err);
      toast.error(errorMessage || "Erro inesperado", {
        description: err.response?.data?.message || err.message,
      });
      return null;
    } finally {
      setLoading(false);
    }

  }, []);


  // ---------------------------------------------------------
  // GET POS-VENDA LIST
  // ---------------------------------------------------------
  const fetchPosVendas = useCallback(async (filters: any = {}) => {
    const res = await withApiHandling(
      () => api.get("/pos-venda", { params: filters, headers: getAuthHeaders() }),
      undefined,
      "Erro ao buscar acompanhamentos."
    );

    if (res) setPosVendas(res.data);
  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // GET DASHBOARD
  // ---------------------------------------------------------
  const fetchDashboard = useCallback(async () => {
    const res = await withApiHandling(
      () => api.get("/pos-venda/dashboard", { headers: getAuthHeaders() }),
      undefined,
      "Erro ao carregar dados do dashboard."
    );

    if (res) setDashboardData(res.data);
  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // FIND UNIQUE
  // ---------------------------------------------------------
  const findUniquePosVenda = useCallback(async (id: string) => {
    const res = await withApiHandling(
      () => api.get(`/pos-venda/${id}`, { headers: getAuthHeaders() }),
      undefined,
      "Erro ao buscar detalhes."
    );

    return res ? res.data : null;
  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // CREATE POS-VENDA
  // ---------------------------------------------------------
  const createPosVenda = useCallback(async (data: CreatePosVenda) => {
    const payload = {
      vendaId: data.vendaId,
      clienteId: data.clienteId,
      observacoes: data.observacoes,
    };

    const res = await withApiHandling(
      () => api.post("/pos-venda", payload, { headers: getAuthHeaders() }),
      "Acompanhamento criado com sucesso!",
      "Erro ao criar acompanhamento."
    );

    if (res) fetchPosVendas();
    return res ? res.data : null;

  }, [getAuthHeaders, withApiHandling, fetchPosVendas]);


  // ---------------------------------------------------------
  // UPDATE POS-VENDA
  // ---------------------------------------------------------
  const updatePosVenda = useCallback(async (id: string, data: Partial<PosVenda>) => {

    const res = await withApiHandling(
      () => api.put(`/pos-venda/${id}`, data, { headers: getAuthHeaders() }),
      "Acompanhamento atualizado!",
      "Erro ao atualizar acompanhamento."
    );

    if (res) {
      setPosVendas(prev => prev.map(pv => pv.id === id ? { ...pv, ...res.data } : pv));
    }

    return res ? res.data : null;

  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // FOLLOW-UP
  // ---------------------------------------------------------
  const agendarFollowUp = useCallback(async (posVendaId: string, followUpData: AgendarFollowUpData) => {

    const res = await withApiHandling(
      () =>
        api.post(`/pos-venda/${posVendaId}/follow-up`, followUpData, {
          headers: getAuthHeaders(),
        }),
      "Follow-up agendado!",
      "Erro ao agendar follow-up."
    );

    return res ? res.data : null;

  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // FINALIZAR POS-VENDA
  // ---------------------------------------------------------
  const finalizarAtendimento = useCallback(async (posVendaId: string) => {

    const res = await withApiHandling(
      () => api.patch(`/pos-venda/${posVendaId}/finalizar`, {}, { headers: getAuthHeaders() }),
      "Atendimento finalizado!",
      "Erro ao finalizar atendimento."
    );

    if (res) {
      setPosVendas(prev =>
        prev.map(pv =>
          pv.id === posVendaId ? { ...pv, status: "FINALIZADO" } : pv
        )
      );
    }

  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // ENVIAR PESQUISA
  // ---------------------------------------------------------
  const enviarPesquisa = useCallback(async (posVendaId: string) => {
    await withApiHandling(
      () =>
        api.post(`/pos-venda/${posVendaId}/enviar-pesquisa`, {}, {
          headers: getAuthHeaders(),
        }),
      "Pesquisa enviada!",
      "Erro ao enviar pesquisa."
    );
  }, [getAuthHeaders, withApiHandling]);


  // ---------------------------------------------------------
  // PROVIDER
  // ---------------------------------------------------------
  return (
    <PosVendaContext.Provider
      value={{
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
        enviarPesquisa,
      }}
    >
      {children}
    </PosVendaContext.Provider>
  );
};


// ---------------------------------------------------------
// HOOK
// ---------------------------------------------------------
export const usePosVenda = () => {
  const ctx = useContext(PosVendaContext);
  if (!ctx) throw new Error("usePosVenda must be used within a PosVendaProvider");
  return ctx;
};
