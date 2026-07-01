import Link from "next/link";
import { Shell } from "./components";

export default function Home() {
  return (
    <Shell>
      <section className="hero">
        <div className="hero-content">
          <h1>
            <span className="typewriter">Olá, eu sou o Zeta!</span>
          </h1>

          <p className="question">Como posso te ajudar hoje?</p>

          <p className="lead">
            Escolha o que quer criar. O Zeta transforma contexto de negócio em
            site, CRM ou sistema operacional para sua empresa.
          </p>

          <div className="actions">
            <Link href="/criar" className="button">
              Começar agora <span aria-hidden>→</span>
            </Link>
            <Link href="/produtos" className="button secondary">
              Ver produtos <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
