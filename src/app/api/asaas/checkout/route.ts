import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { callAsaas } from "../../../lib/asaas";
import { findZetaPlan } from "../../../lib/plans";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

type CheckoutRequest = {
  product?: string;
  customerName?: string;
  customerEmail?: string;
  briefing?: string;
};

type AsaasCustomer = {
  id: string;
};

type AsaasPayment = {
  id: string;
  invoiceUrl?: string;
  value: number;
  status: string;
  externalReference?: string;
};

type AsaasPixQrCode = {
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
};

function getDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function normalizeInput(input: CheckoutRequest) {
  const customerName = input.customerName?.trim();
  const customerEmail = input.customerEmail?.trim();

  if (!customerName || !customerEmail) {
    return { error: "Informe nome e email para gerar o pagamento." };
  }

  return {
    data: {
      product: input.product,
      customerName,
      customerEmail,
      briefing: input.briefing?.trim() ?? "",
    },
  };
}

export async function POST(request: Request) {
  const input = (await request.json().catch(() => ({}))) as CheckoutRequest;
  const normalized = normalizeInput(input);

  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  if (!process.env.ASAAS_ACCESS_TOKEN) {
    return NextResponse.json(
      {
        mode: "setup_required",
        message: "Configure ASAAS_ACCESS_TOKEN para gerar cobranças reais no Asaas.",
      },
      { status: 200 },
    );
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para registrar e aprovar pagamentos.",
      },
      { status: 500 },
    );
  }

  const plan = findZetaPlan(normalized.data.product);
  const externalReference = `zeta-${plan.slug}-${randomUUID()}`;

  const orderResponse = await supabase
    .from("zeta_checkout_orders")
    .insert({
      external_reference: externalReference,
      plan_slug: plan.slug,
      plan_name: plan.name,
      amount: plan.value,
      customer_name: normalized.data.customerName,
      customer_email: normalized.data.customerEmail,
      briefing: normalized.data.briefing,
      status: "pending",
      metadata: {
        source: "zeta_checkout",
      },
    })
    .select("id")
    .single();

  if (orderResponse.error) {
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido antes do pagamento." },
      { status: 500 },
    );
  }

  const customerResponse = await callAsaas<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: normalized.data.customerName,
      email: normalized.data.customerEmail,
    }),
  });

  if ("error" in customerResponse) {
    await supabase
      .from("zeta_checkout_orders")
      .update({
        status: "failed",
        metadata: {
          source: "zeta_checkout",
          asaas_error: customerResponse.details,
        },
      })
      .eq("id", orderResponse.data.id);

    return NextResponse.json(customerResponse, { status: customerResponse.status });
  }

  const paymentResponse = await callAsaas<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customerResponse.data.id,
      billingType: "PIX",
      value: plan.value,
      dueDate: getDueDate(),
      description: `${plan.name} - Zeta`,
      externalReference,
    }),
  });

  if ("error" in paymentResponse) {
    await supabase
      .from("zeta_checkout_orders")
      .update({
        status: "failed",
        metadata: {
          source: "zeta_checkout",
          asaas_error: paymentResponse.details,
        },
      })
      .eq("id", orderResponse.data.id);

    return NextResponse.json(paymentResponse, { status: paymentResponse.status });
  }

  await supabase
    .from("zeta_checkout_orders")
    .update({
      asaas_payment_id: paymentResponse.data.id,
      asaas_status: paymentResponse.data.status,
      invoice_url: paymentResponse.data.invoiceUrl ?? null,
    })
    .eq("id", orderResponse.data.id);

  const pixResponse = await callAsaas<AsaasPixQrCode>(
    `/payments/${paymentResponse.data.id}/pixQrCode`,
    { method: "GET" },
  );

  if ("error" in pixResponse) {
    return NextResponse.json(pixResponse, { status: pixResponse.status });
  }

  return NextResponse.json({
    mode: "asaas",
    order: {
      id: orderResponse.data.id,
      externalReference,
      status: "pending",
    },
    payment: paymentResponse.data,
    pix: pixResponse.data,
    plan,
  });
}
