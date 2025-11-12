import axios from "axios";
import https from "https";
import fs from "fs";

/**
 * ✅ Carrega variáveis do .env
 */
const {
  INTER_CLIENT_ID,
  INTER_CLIENT_SECRET,
  INTER_OAUTH_URL,
  INTER_COBRANCA_BASE,
  INTER_CERT_PATH,
  INTER_KEY_PATH,
  INTER_KEY_PASSPHRASE,
  INTER_SCOPE, // opcional no .env
} = process.env;

/**
 * ✅ Cria um agente HTTPS com mTLS (cert + key)
 */
const httpsAgent = new https.Agent({
  cert: fs.readFileSync(String(INTER_CERT_PATH)),
  key: fs.readFileSync(String(INTER_KEY_PATH)),
  passphrase: INTER_KEY_PASSPHRASE || undefined,
  rejectUnauthorized: true,
});

/**
 * 🧠 Cache simples de token (para evitar gerar a cada requisição)
 */
let tokenCache = {
  token: "",
  expiresAt: 0,
};

/**
 * 🔐 Função que obtém o access_token via OAuth2 Client Credentials
 */
export async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // ✅ Usa o token em cache se ainda estiver válido
  if (tokenCache.token && now < tokenCache.expiresAt - 60) {
    return tokenCache.token;
  }

  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");

  // Escopo padrão: cobrança com Pix
  body.append("scope", INTER_SCOPE || "cobranca.read cobranca.write");

  const basicAuth = Buffer.from(
    `${INTER_CLIENT_ID}:${INTER_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(String(INTER_OAUTH_URL), body, {
      httpsAgent,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    });

    tokenCache = {
      token: response.data.access_token,
      expiresAt: now + response.data.expires_in,
    };

    console.log("🔑 Novo token gerado com sucesso");
    return tokenCache.token;
  } catch (error: any) {
    const errData = error.response?.data || error.message;

    // 🚨 Tratamento específico para erro de escopo
    if (
      errData?.error === "requested scope is not registered for this client"
    ) {
      console.error(
        "\n❌ O escopo informado não está habilitado para o client_id atual.\n" +
          "👉 Vá até https://developers.inter.co/ → Minhas Aplicações → verifique o escopo ativo.\n" +
          "💡 Se estiver usando a API de cobrança, use 'cobranca.read cobranca.write'.\n"
      );
    } else {
      console.error("\n❌ Erro ao gerar token OAuth2 do Banco Inter:\n", errData);
    }

    throw new Error(
      `Falha ao obter token OAuth2: ${
        typeof errData === "object" ? JSON.stringify(errData) : errData
      }`
    );
  }
}

/**
 * 🧭 Cliente Axios autenticado para chamadas às APIs do Banco Inter
 */
export async function interApi() {
  const token = await getAccessToken();

  return axios.create({
    baseURL: String(INTER_COBRANCA_BASE),
    httpsAgent,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });
}
