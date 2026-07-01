import { NextResponse } from "next/server";

type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    externalReference?: string;
    value?: number;
  };
};

function isAuthorized(request: Request) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const receivedToken = request.headers.get("asaas-access-token");

  if (!expectedToken) {
    return false;
  }

  return receivedToken === expectedToken;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as AsaasWebhookPayload | null;

  if (!payload?.event) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  // Primeira versão: valida e confirma recebimento.
  // Próximo passo: persistir idempotência pelo payload.id e atualizar pedido/pagamento.
  return NextResponse.json({
    received: true,
    event: payload.event,
    paymentId: payload.payment?.id ?? null,
  });
}
