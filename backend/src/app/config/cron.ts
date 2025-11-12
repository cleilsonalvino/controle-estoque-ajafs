import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Agendado para rodar todo dia à meia-noite
cron.schedule("0 0 * * *", async () => {
  console.log("=============================================");
  console.log("CRON: Verificando pós-vendas pendentes...");
  console.log("=============================================");

  const tresDiasAtras = new Date();
  tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

  try {
    const pendentes = await prisma.posVenda.findMany({
      where: {
        status: "PENDENTE",
        criadoEm: {
          lte: tresDiasAtras,
        },
      },
      include: {
        cliente: true,
      }
    });

    if (pendentes.length === 0) {
      console.log("Nenhum pós-venda pendente encontrado.");
      return;
    }

    for (const posVenda of pendentes) {
      // Aqui, você integraria com um serviço de e-mail para enviar o link.
      // O link seria algo como: https://seu-frontend.com/feedback/${posVenda.id}
      console.log(`INFO: Enviando link de feedback para o cliente ${posVenda.cliente?.nome} (Venda: ${posVenda.vendaId})`);
      
      // Opcional: Mudar o status para "EM_ANDAMENTO" após enviar o link
      await prisma.posVenda.update({
          where: { id: posVenda.id },
          data: { status: "EM_ANDAMENTO" }
      });
    }

    console.log(`${pendentes.length} links de feedback enviados.`);

  } catch (error) {
    console.error("CRON ERROR: Falha ao processar pós-vendas pendentes:", error);
  }
});
