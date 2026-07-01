const ASAAS_SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_PRODUCTION_URL = "https://api.asaas.com/v3";

function getAsaasBaseUrl() {
  return process.env.ASAAS_ENVIRONMENT === "production"
    ? ASAAS_PRODUCTION_URL
    : ASAAS_SANDBOX_URL;
}

export async function callAsaas<T>(path: string, init: RequestInit) {
  const accessToken = process.env.ASAAS_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("ASAAS_ACCESS_TOKEN ausente");
  }

  const response = await fetch(`${getAsaasBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Zeta/0.1.0 (Next.js)",
      access_token: accessToken,
      ...init.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as T | { errors?: unknown[] } | null;

  if (!response.ok) {
    return {
      error: "O Asaas recusou a solicitação.",
      status: response.status,
      details: body,
    };
  }

  return { data: body as T };
}

export function getAsaasWebhookToken() {
  return process.env.ASAAS_WEBHOOK_TOKEN;
}
