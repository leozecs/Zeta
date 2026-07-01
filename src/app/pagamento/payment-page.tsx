"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { findZetaPlan } from "../lib/plans";
import { formatCurrency, Shell } from "../components";

type CheckoutStatus = "idle" | "loading" | "setup_required" | "ready" | "approved" | "error";

type CheckoutResponse = {
  mode?: "setup_required" | "asaas";
  message?: string;
  error?: string;
  payment?: {
    id: string;
    invoiceUrl?: string;
    status: string;
    value: number;
  };
  order?: {
    id: string;
    externalReference: string;
    status: string;
  };
  pix?: {
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  };
};

export function PaymentPage() {
  const [productName, setProductName] = useState("Zeta Site");
  const [briefing, setBriefing] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const plan = useMemo(() => findZetaPlan(productName), [productName]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setProductName(searchParams.get("produto") ?? "Zeta Site");
    setBriefing(searchParams.get("briefing") ?? "");
  }, []);

  async function createPayment() {
    setStatus("loading");
    setCheckout(null);

    const response = await fetch("/api/asaas/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: plan.name,
        customerName,
        customerEmail,
        briefing,
      }),
    });

    const data = (await response.json()) as CheckoutResponse;
    setCheckout(data);

    if (!response.ok || data.error) {
      setStatus("error");
      return;
    }

    setStatus(data.mode === "setup_required" ? "setup_required" : "ready");
    setStatusMessage("Pix gerado. Assim que o Asaas confirmar o pagamento, a Zeta aprova automaticamente.");
  }

  useEffect(() => {
    if (status !== "ready" || !checkout?.order?.id) {
      return;
    }

    let isMounted = true;

    async function pollPaymentStatus() {
      const response = await fetch(`/api/asaas/status?orderId=${checkout?.order?.id}`);
      const data = (await response.json().catch(() => null)) as
        | { approved?: boolean; order?: { status?: string } }
        | null;

      if (!isMounted || !response.ok || !data) {
        return;
      }

      if (data.approved || data.order?.status === "approved") {
        setStatus("approved");
        setStatusMessage("Pagamento aprovado. O projeto já pode seguir para liberação.");
      }
    }

    void pollPaymentStatus();
    const interval = window.setInterval(() => void pollPaymentStatus(), 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [checkout?.order?.id, status]);

  async function copyPixPayload() {
    if (!checkout?.pix?.payload) {
      return;
    }

    await navigator.clipboard.writeText(checkout.pix.payload);
  }

  return (
    <Shell>
      <section className="payment-page">
        <div className="payment-heading">
          <div className="pill">Pagamento</div>
          <h1>Último passo antes do projeto começar.</h1>
          <p>
            Esta tela já está preparada para o Asaas. Hoje ela coleta os dados do
            pagador, confirma o produto e chama o endpoint seguro que irá gerar o
            Pix.
          </p>
        </div>

        <div className="payment-grid">
          <aside className="payment-summary">
            <span>Produto escolhido</span>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>

            <div className="summary-price">
              <strong>{formatCurrency(plan.value)}</strong>
              <small>cobrança inicial via Pix</small>
            </div>

            {briefing ? (
              <div className="briefing-box">
                <span>Briefing enviado</span>
                <p>{briefing}</p>
              </div>
            ) : (
              <Link href={`/criar?produto=${encodeURIComponent(plan.name)}`} className="button secondary">
                Completar briefing
              </Link>
            )}
          </aside>

          <div className="checkout-panel">
            <div className="checkout-copy">
              <span>Checkout Asaas</span>
              <h2>Gerar Pix</h2>
              <p>
                Quando a chave Asaas estiver no ambiente, este botão cria o cliente,
                gera a cobrança Pix e retorna QR Code + Pix copia e cola.
              </p>
            </div>

            <div className="checkout-form">
              <label className="field">
                <span>Nome do pagador</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Nome ou empresa"
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  type="email"
                  placeholder="voce@empresa.com"
                />
              </label>

              <button
                type="button"
                className="button"
                disabled={status === "loading" || !customerName || !customerEmail}
                onClick={createPayment}
              >
                {status === "loading" ? "Gerando..." : "Gerar pagamento Asaas"}
                <span aria-hidden>→</span>
              </button>
            </div>

            <div className="asaas-result" data-status={status}>
              {status === "idle" ? (
                <p>Preencha os dados para preparar o Pix.</p>
              ) : null}

              {status === "setup_required" ? (
                <p>
                  Integração pronta, mas falta configurar <code>ASAAS_ACCESS_TOKEN</code>
                  no ambiente para gerar cobranças reais.
                </p>
              ) : null}

              {status === "error" ? <p>{checkout?.error ?? "Não foi possível gerar o pagamento."}</p> : null}

              {status === "ready" ? (
                <div className="pix-box">
                  <p>{statusMessage}</p>

                  {checkout?.pix?.encodedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`data:image/png;base64,${checkout.pix.encodedImage}`} alt="QR Code Pix" />
                  ) : null}

                  {checkout?.pix?.payload ? (
                    <>
                      <textarea readOnly value={checkout.pix.payload} rows={4} />
                      <button type="button" className="button secondary" onClick={copyPixPayload}>
                        Copiar Pix copia e cola
                      </button>
                    </>
                  ) : null}

                  {checkout?.payment?.invoiceUrl ? (
                    <Link href={checkout.payment.invoiceUrl} className="button" target="_blank">
                      Abrir fatura Asaas <span aria-hidden>→</span>
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {status === "approved" ? (
                <div className="pix-box">
                  <h2>Pagamento aprovado</h2>
                  <p>{statusMessage}</p>
                  <Link href="/entrar?modo=criar" className="button">
                    Criar acesso <span aria-hidden>→</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
