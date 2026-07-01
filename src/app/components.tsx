import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <span className="logo">
      <Image src="/zeta-logo-white.png" alt="Zeta" fill priority sizes="112px" />
    </span>
  );
}

export function ZetaBackground() {
  return (
    <div className="zeta-background" aria-hidden>
      <svg viewBox="0 0 1000 560" preserveAspectRatio="none" role="presentation">
        <path d="M80 80 H930 L80 480 H930" />
      </svg>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="shell">
      <ZetaBackground />

      <header className="header">
        <div className="header-inner">
          <Link href="/" aria-label="Zeta início">
            <Logo />
          </Link>

          <nav className="nav">
            <Link href="/">Início</Link>
            <Link href="/produtos">Produtos</Link>
            <Link href="/entrar?modo=login">Entrar</Link>
          </nav>

          <Link href="/criar" className="button">
            Começar <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      {children}
    </main>
  );
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export const products = [
  {
    name: "Zeta Site",
    monthly: 120,
    annualMonthly: 108,
    description:
      "Sites institucionais e páginas de venda para empresas que precisam parecer maiores, mais claras e mais confiáveis.",
    features: ["Página pronta para publicar", "Copy comercial", "SEO essencial"],
  },
  {
    name: "Zeta CRM",
    monthly: 159,
    annualMonthly: 143,
    description:
      "CRM adaptado ao seu mercado para organizar contatos, leads, oportunidades e rotina comercial sem planilha solta.",
    features: ["Pipeline por segmento", "Cadastro de clientes", "Rotina de vendas"],
  },
  {
    name: "Zeta OS",
    monthly: 229,
    annualMonthly: 206,
    description:
      "Sistema operacional SaaS para transformar atendimento, agenda e processos internos em um produto digital.",
    features: ["Fluxos internos", "Painel de operação", "Base para escalar"],
  },
];

export const completePlan = {
  name: "Tudo junto",
  monthly: 469.99,
  annualMonthly: 423,
  description:
    "O pacote completo para tirar a empresa do improviso: presença digital, CRM e operação trabalhando juntos, com uma evolução única em vez de três projetos separados.",
  features: [
    "Todos os produtos da Zeta",
    "Economia frente aos planos separados",
    "Caminho completo para operação digital",
  ],
};
