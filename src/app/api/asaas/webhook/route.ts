import { NextResponse } from "next/server";
import { getAsaasWebhookToken } from "../../../lib/asaas";
import { mapAsaasPaymentStatus } from "../../../lib/checkout-status";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    externalReference?: string;
    value?: number;
    confirmedDate?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
    invoiceUrl?: string;
  };
};

function isAuthorized(request: Request) {
  const expectedToken = getAsaasWebhookToken();
  const receivedToken = request.headers.get("asaas-access-token");

  if (!expectedToken) {
    return false;
  }

  return receivedToken === expectedToken;
}

function getPaidAt(payload: AsaasWebhookPayload) {
  return (
    payload.payment?.clientPaymentDate ??
    payload.payment?.paymentDate ??
    payload.payment?.confirmedDate ??
    new Date().toISOString()
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as AsaasWebhookPayload | null;

  if (!payload?.event || !payload.payment?.id) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  const status = mapAsaasPaymentStatus(payload.payment.status);
  const paidAt = status === "approved" ? getPaidAt(payload) : null;

  const webhookEventId = payload.id ?? `${payload.event}:${payload.payment.id}`;

  const update = {
    status,
    asaas_status: payload.payment.status ?? payload.event,
    invoice_url: payload.payment.invoiceUrl ?? null,
    paid_at: paidAt,
    approved_at: paidAt,
    metadata: {
      last_webhook_event: payload.event,
      last_webhook_received_at: new Date().toISOString(),
    },
  };

  const query = payload.payment.externalReference
    ? supabase
        .from("zeta_checkout_orders")
        .update(update)
        .eq("external_reference", payload.payment.externalReference)
        .select("id, webhook_event_ids")
        .maybeSingle()
    : supabase
        .from("zeta_checkout_orders")
        .update(update)
        .eq("asaas_payment_id", payload.payment.id)
        .select("id, webhook_event_ids")
        .maybeSingle();

  const updatedOrder = await query;

  if (updatedOrder.error) {
    return NextResponse.json({ error: "Não foi possível atualizar pedido." }, { status: 500 });
  }

  if (!updatedOrder.data) {
    return NextResponse.json({ received: true, matched: false });
  }

  const eventIds = new Set<string>(updatedOrder.data.webhook_event_ids ?? []);
  eventIds.add(webhookEventId);

  await supabase
    .from("zeta_checkout_orders")
    .update({ webhook_event_ids: Array.from(eventIds) })
    .eq("id", updatedOrder.data.id);

  return NextResponse.json({
    received: true,
    matched: true,
    status,
    paymentId: payload.payment.id,
  });
}
