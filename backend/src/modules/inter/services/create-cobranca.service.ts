import { interApi } from "../infra/inter-client.provider";
import { CreateCobrancaDTO } from "../dtos/create-cobranca.dto";

export class CreateCobrancaService {
  async execute(data: CreateCobrancaDTO) {
    const api = await interApi();

    const payload = {
      seuNumero: data.seuNumero,
      valorNominal: data.valorNominal,
      dataVencimento: data.dataVencimento,
      pagador: data.pagador,
      pix: { expiracaoSegundos: 3600 },
    };

    const response = await api.post("/cobrancas", payload);

    // aqui você pode salvar no banco via Prisma se quiser
    return response.data;
  }
}
