import axios from "axios";
import https from "https";
import fs from "fs";

const {
  INTER_CLIENT_ID,
  INTER_CLIENT_SECRET,
  INTER_OAUTH_URL,
  INTER_CERT_PATH,
  INTER_KEY_PATH,
  INTER_KEY_PASSPHRASE,
  INTER_SCOPE,
} = process.env;

const httpsAgent = new https.Agent({
  cert: fs.readFileSync(String(INTER_CERT_PATH)),
  key: fs.readFileSync(String(INTER_KEY_PATH)),
  passphrase: INTER_KEY_PASSPHRASE || undefined,
  rejectUnauthorized: true,
});

let tokenCache = { token: "", expiresAt: 0 };

export class AuthService {
  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (tokenCache.token && now < tokenCache.expiresAt - 60) {
      return tokenCache.token;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", INTER_SCOPE || "cobranca.read cobranca.write");

    const auth = Buffer.from(`${INTER_CLIENT_ID}:${INTER_CLIENT_SECRET}`).toString("base64");

    try {
      const { data } = await axios.post(String(INTER_OAUTH_URL), params, {
        httpsAgent,
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      tokenCache = {
        token: data.access_token,
        expiresAt: now + data.expires_in,
      };

      console.log("🔑 Novo token gerado com sucesso!");
      return tokenCache.token;
    } catch (error: any) {
      console.error("❌ Erro ao autenticar:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error_description || "Falha ao gerar token OAuth2"
      );
    }
  }
}
