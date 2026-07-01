import { NextResponse } from "next/server";
import { findZetaPlan } from "../../../lib/plans";

const ASAAS_SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_PRODUCTION_URL = "https://api.asaas.com/v3";

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
};

type AsaasPixQrCode = {
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
};

function getAsaasBaseUrl() {
  return process.env.ASAAS_ENVIRONMENT === "production"
    ? ASAAS_PRODUCTION_URL
    : ASAAS_SANDBOX_URL;
}

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

async function callAsaas<T>(path: string, init: RequestInit) {
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

  const plan = findZetaPlan(normalized.data.product);

  const customerResponse = await callAsaas<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: normalized.data.customerName,
      email: normalized.data.customerEmail,
    }),
  });

  if ("error" in customerResponse) {
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
      externalReference: `zeta-${plan.slug}-${Date.now()}`,
    }),
  });

  if ("error" in paymentResponse) {
    return NextResponse.json(paymentResponse, { status: paymentResponse.status });
  }

  const pixResponse = await callAsaas<AsaasPixQrCode>(
    `/payments/${paymentResponse.data.id}/pixQrCode`,
    { method: "GET" },
  );

  if ("error" in pixResponse) {
    return NextResponse.json(pixResponse, { status: pixResponse.status });
  }

  return NextResponse.json({
    mode: "asaas",
    payment: paymentResponse.data,
    pix: pixResponse.data,
    plan,
  });
}
