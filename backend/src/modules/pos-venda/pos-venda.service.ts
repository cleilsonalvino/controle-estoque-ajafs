import { PrismaClient, Papel } from "@prisma/client";
import { CustomError } from "../../shared/errors";
import type {
    CreatePosVendaDto,
    UpdatePosVendaDto,
    CreateFeedbackDto,
    CreateFollowUpDto,
    UpdateFollowUpDto
} from "./pos-venda.dto";

const prisma = new PrismaClient();

// ================================================
// LISTAR PÓS-VENDAS
// ================================================

export const getPosVendasService = async (
    empresaId: string,
    user: { id: string; papel: Papel; vendedorId?: string }
) => {
    const where: any = { empresaId };

    if (user.papel === Papel.VENDEDOR) {
        where.venda = {
            vendedorId: user.id
        };
    }

    return prisma.posVenda.findMany({
        where,
        include: {
            venda: {
                include: { vendedor: true }
            },
            cliente: true,
            usuario: true
        },
        orderBy: { criadoEm: "desc" }
    });
};

// ================================================
// BUSCAR POR ID
// ================================================

export const getPosVendaByIdService = async (id: string, empresaId: string) => {
    const posVenda = await prisma.posVenda.findFirst({
        where: { id, empresaId },
        include: {
            venda: {
                include: {
                    vendedor: true,
                    cliente: true
                }
            },
            cliente: true,
            usuario: true,
            feedbacks: true,
            followUps: true
        }
    });

    if (!posVenda) {
        throw new CustomError("Acompanhamento pós-venda não encontrado.", 404);
    }

    return posVenda;
};

// ================================================
// CRIAR PÓS-VENDA
// ================================================

export const createPosVendaService = async (
    data: CreatePosVendaDto,
    empresaId: string,
    usuarioId: string
) => {
    const venda = await prisma.venda.findFirst({
        where: { id: data.vendaId, empresaId }
    });

    if (!venda) {
        throw new CustomError("Venda não encontrada para criar o pós-venda.", 404);
    }

    return prisma.posVenda.create({
        data: {
            ...data,
            empresaId,
            usuarioId,
            clienteId: venda.clienteId
        }
    });
};

// ================================================
// ATUALIZAR PÓS-VENDA
// ================================================

export const updatePosVendaService = async (
    id: string,
    data: UpdatePosVendaDto,
    empresaId: string
) => {
    const posVenda = await prisma.posVenda.findFirst({
        where: { id, empresaId }
    });

    if (!posVenda) {
        throw new CustomError("Acompanhamento pós-venda não encontrado.", 404);
    }

    return prisma.posVenda.update({
        where: { id },
        data
    });
};

// ================================================
// DELETAR PÓS-VENDA
// ================================================

export const deletePosVendaService = async (id: string, empresaId: string) => {
    const posVenda = await prisma.posVenda.findFirst({
        where: { id, empresaId }
    });

    if (!posVenda) {
        throw new CustomError("Acompanhamento pós-venda não encontrado.", 404);
    }

    await prisma.posVenda.delete({ where: { id } });

    return { message: "Acompanhamento excluído com sucesso." };
};

// ================================================
// FOLLOW-UP
// ================================================

export const createFollowUpService = async (
    data: CreateFollowUpDto,
    empresaId: string
) => {
    const posVenda = await prisma.posVenda.findFirst({
        where: { id: data.posVendaId, empresaId }
    });

    if (!posVenda) {
        throw new CustomError("Acompanhamento pós-venda não encontrado.", 404);
    }

    return prisma.followUp.create({
        data: {
            ...data,
            empresaId
        }
    });
};

export const updateFollowUpService = async (
    id: string,
    data: UpdateFollowUpDto,
    empresaId: string
) => {
    const followUp = await prisma.followUp.findFirst({
        where: { id, empresaId }
    });

    if (!followUp) {
        throw new CustomError("Follow-up não encontrado.", 404);
    }

    return prisma.followUp.update({
        where: { id },
        data
    });
};

// ================================================
// FINALIZAR ATENDIMENTO
// ================================================

export const finalizarPosVendaService = async (id: string, empresaId: string) => {
    const posVenda = await prisma.posVenda.findFirst({
        where: { id, empresaId }
    });

    if (!posVenda) {
        throw new CustomError("Acompanhamento pós-venda não encontrado.", 404);
    }

    return prisma.posVenda.update({
        where: { id },
        data: { status: "FINALIZADO" }
    });
};

// ================================================
// ENVIAR PESQUISA
// ================================================

export const enviarPesquisaService = async (id: string, empresaId: string) => {
    const posVenda = await prisma.posVenda.findFirst({
        where: { id, empresaId },
        include: {
            cliente: true,
            empresa: true
        }
    });

    if (!posVenda) {
        throw new CustomError("Acompanhamento pós-venda não encontrado.", 404);
    }

    // aqui você poderá integrar com whatsapp ou email
    console.log(`Enviar pesquisa para cliente ID: ${posVenda.clienteId}`);

    return true;
};

// ================================================
// FORM PÚBLICO DE FEEDBACK
// ================================================

export const getFeedbackFormService = async (posVendaId: string) => {
    const posVenda = await prisma.posVenda.findUnique({
        where: { id: posVendaId },
        select: {
            id: true,
            venda: {
                select: {
                    numero: true,
                    cliente: { select: { nome: true } }
                }
            },
            empresa: { select: { nomeFantasia: true } }
        }
    });

    if (!posVenda) {
        throw new CustomError("Link inválido", 404);
    }

    return posVenda;
};

export const createFeedbackService = async (
    posVendaId: string,
    data: CreateFeedbackDto
) => {
    const posVenda = await prisma.posVenda.findUnique({
        where: { id: posVendaId }
    });

    if (!posVenda) throw new CustomError("Link inválido.", 404);

    const feedback = await prisma.feedbackCliente.create({
        data: {
            posVendaId,
            empresaId: posVenda.empresaId,
            avaliacao: data.avaliacao,
            comentario: data.comentario
        }
    });

    await prisma.posVenda.update({
        where: { id: posVendaId },
        data: {
            satisfacao: data.avaliacao,
            status: "FINALIZADO"
        }
    });

    return feedback;
};

// ================================================
// DASHBOARD
// ================================================

export const getDashboardDataService = async (empresaId: string) => {
    const agregados = await prisma.posVenda.aggregate({
        where: { empresaId },
        _avg: { satisfacao: true },
        _count: { status: true }
    });

    const followUps = await prisma.followUp.groupBy({
        by: ["realizado"],
        where: { empresaId },
        _count: true
    });

    const finalizados = await prisma.posVenda.count({
        where: { empresaId, status: "FINALIZADO" }
    });

    const clientesComRetorno = await prisma.posVenda.count({
        where: { empresaId, retornoCliente: true }
    });

    const totalClientesContatados = await prisma.posVenda.count({
        where: {
            empresaId,
            status: { in: ["EM_ANDAMENTO", "FINALIZADO"] }
        }
    });

    return {
        mediaSatisfacao: agregados._avg.satisfacao || 0,
        followUpsPendentes:
            followUps.find((f) => f.realizado === false)?._count || 0,
        followUpsRealizados:
            followUps.find((f) => f.realizado === true)?._count || 0,
        posVendasFinalizadas: finalizados,
        taxaRetorno:
            totalClientesContatados > 0
                ? (clientesComRetorno / totalClientesContatados) * 100
                : 0
    };
};
