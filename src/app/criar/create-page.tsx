"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { products, Shell } from "../components";

const questions = [
  "Qual é o nome do seu negócio e o que ele vende?",
  "Hoje você quer resolver mais presença digital, organização comercial ou operação interna?",
  "O que precisa existir na primeira versão para você dizer: ficou pronto?",
];

export function CreatePage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(products[0].name);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));

  const product = useMemo(
    () => products.find((item) => item.name === selectedProduct) ?? products[0],
    [selectedProduct],
  );

  const answeredCount = answers.filter((answer) => answer.trim().length > 0).length;
  const isReady = answeredCount === questions.length;

  useEffect(() => {
    const productParam = new URLSearchParams(window.location.search).get("produto");

    if (productParam && products.some((item) => item.name === productParam)) {
      setSelectedProduct(productParam);
    }
  }, []);

  function updateAnswer(index: number, value: string) {
    setAnswers((current) =>
      current.map((answer, answerIndex) => (answerIndex === index ? value : answer)),
    );
  }

  function goToPayment() {
    const searchParams = new URLSearchParams({
      produto: product.name,
      briefing: answers.map((answer) => answer.trim()).join("\n\n"),
    });

    router.push(`/pagamento?${searchParams.toString()}`);
  }

  return (
    <Shell>
      <section className="create-page">
        <div className="create-heading">
          <div className="pill">Criar com Zeta</div>
          <h1>Me conta o negócio. Eu organizo o caminho.</h1>
          <p>
            Primeiro escolha o produto. Depois responda como se estivesse conversando
            comigo. A próxima etapa será pagamento e abertura do projeto.
          </p>
        </div>

        <div className="create-grid">
          <aside className="product-picker" aria-label="Tipo de produto">
            <span>Tipo de produto</span>

            <div className="product-options">
              {products.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={selectedProduct === item.name}
                  onClick={() => setSelectedProduct(item.name)}
                >
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </aside>

          <div className="chat-form" aria-label="Briefing do negócio">
            <div className="chat-message zeta">
              <span>Zeta</span>
              <p>
                Boa. Vamos começar por <strong>{product.name}</strong>. Me responda
                com sinceridade, sem texto bonito. Eu transformo isso em direção de
                produto depois.
              </p>
            </div>

            {questions.map((question, index) => (
              <label className="chat-question" key={question}>
                <span>
                  {index + 1}. {question}
                </span>
                <textarea
                  value={answers[index]}
                  onChange={(event) => updateAnswer(index, event.target.value)}
                  placeholder="Digite aqui..."
                  rows={4}
                />
              </label>
            ))}

            <div className="payment-preview">
              <div>
                <span>Próxima etapa</span>
                <h2>Pagamento</h2>
                <p>
                  Futuramente esta área vira checkout. Por enquanto, ela confirma o
                  produto escolhido e prepara o resumo que o Zeta vai usar para
                  entender o seu negócio.
                </p>
              </div>

              <button type="button" className="button" disabled={!isReady} onClick={goToPayment}>
                {isReady ? "Ir para pagamento" : `Responder ${questions.length - answeredCount} perguntas`}
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
