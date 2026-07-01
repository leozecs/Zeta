import { NextResponse } from "next/server";
import { callAsaas } from "../../../lib/asaas";
import { mapAsaasPaymentStatus } from "../../../lib/checkout-status";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

type AsaasPaymentDetail = {
  id: string;
  status: string;
  value: number;
  invoiceUrl?: string;
  externalReference?: string;
  confirmedDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
};

function getPaidAt(payment: AsaasPaymentDetail) {
  return (
    payment.clientPaymentDate ??
    payment.paymentDate ??
    payment.confirmedDate ??
    new Date().toISOString()
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  if (!paymentId && !orderId) {
    return NextResponse.json({ error: "Informe paymentId ou orderId." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 500 });
  }

  let orderQuery = supabase.from("zeta_checkout_orders").select("*").limit(1);

  if (orderId) {
    orderQuery = orderQuery.eq("id", orderId);
  } else {
    orderQuery = orderQuery.eq("asaas_payment_id", paymentId);
  }

  const orderResponse = await orderQuery.maybeSingle();

  if (orderResponse.error || !orderResponse.data) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (!orderResponse.data.asaas_payment_id) {
    return NextResponse.json({ order: orderResponse.data });
  }

  const paymentResponse = await callAsaas<AsaasPaymentDetail>(
    `/payments/${orderResponse.data.asaas_payment_id}`,
    { method: "GET" },
  );

  if ("error" in paymentResponse) {
    return NextResponse.json(paymentResponse, { status: paymentResponse.status });
  }

  const status = mapAsaasPaymentStatus(paymentResponse.data.status);
  const approvedAt = status === "approved" ? getPaidAt(paymentResponse.data) : null;

  const updateResponse = await supabase
    .from("zeta_checkout_orders")
    .update({
      status,
      asaas_status: paymentResponse.data.status,
      invoice_url: paymentResponse.data.invoiceUrl ?? orderResponse.data.invoice_url,
      paid_at: approvedAt,
      approved_at: approvedAt,
    })
    .eq("id", orderResponse.data.id)
    .select("*")
    .single();

  if (updateResponse.error) {
    return NextResponse.json({ error: "Não foi possível atualizar o pedido." }, { status: 500 });
  }

  return NextResponse.json({
    order: updateResponse.data,
    payment: paymentResponse.data,
    approved: status === "approved",
  });
}
