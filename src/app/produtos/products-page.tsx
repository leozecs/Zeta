"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { completePlan, formatCurrency, products, Shell } from "../components";

type Billing = "monthly" | "annual";

export function ProductsPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [showComplete, setShowComplete] = useState(false);

  const activePlans = showComplete ? [completePlan] : products;
  const helper = useMemo(() => {
    if (showComplete) {
      return "Site, CRM e operação digital no mesmo pacote, com menos atrito e mais continuidade.";
    }

    return billing === "annual"
      ? "Anual aplica 10% de desconto sobre 12 mensalidades."
      : "Mensal para começar simples, sem contrato anual.";
  }, [billing, showComplete]);

  return (
    <Shell>
      <section className="page">
        <div className="page-heading">
          <div>
            <div className="pill">Produtos</div>
            <h1>Escolha o pacote certo para começar.</h1>
            <p>
              Três produtos independentes. Ou tudo junto quando você quiser
              presença, vendas e operação no mesmo movimento.
            </p>
          </div>

          <div className="pricing-controls">
            <div className="pricing-row">
              <div className="switch" data-active={billing}>
                <button
                  type="button"
                  aria-pressed={billing === "monthly"}
                  onClick={() => setBilling("monthly")}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  aria-pressed={billing === "annual"}
                  onClick={() => setBilling("annual")}
                >
                  Anual
                </button>
              </div>

              <button
                type="button"
                className={showComplete ? "button" : "button secondary"}
                onClick={() => setShowComplete((value) => !value)}
              >
                {showComplete ? "Ver pacotes" : "Tudo junto!"}
              </button>
            </div>
            <p className="helper">{helper}</p>
          </div>
        </div>

        <div className={showComplete ? "cards single" : "cards three"}>
          {activePlans.map((plan) => {
            const isAnnual = billing === "annual";
            const monthlyValue = isAnnual ? plan.annualMonthly : plan.monthly;
            const annualTotal = plan.annualMonthly * 12;

            return (
              <article className="card" key={plan.name}>
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>

                <div className="price">
                  <strong>{formatCurrency(monthlyValue)}</strong>{" "}
                  <span>/mês</span>
                  <p>
                    <small>
                      {isAnnual
                        ? `${formatCurrency(annualTotal)} por ano com 10% de desconto`
                        : "Cobrança mensal"}
                    </small>
                  </p>
                </div>

                <ul className="features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <Link href={`/entrar?modo=criar&plano=${encodeURIComponent(plan.name)}`} className="button">
                  Começar com {plan.name} <span aria-hidden>→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </Shell>
  );
}
