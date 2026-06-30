"use client";

import { useEffect, useState } from "react";
import { Logo, Shell } from "../components";

type EntryMode = "create" | "login";

export function EntryPage() {
  const [mode, setMode] = useState<EntryMode>("create");
  const isCreate = mode === "create";

  useEffect(() => {
    const queryMode = new URLSearchParams(window.location.search).get("modo");
    setMode(queryMode === "login" ? "login" : "create");
  }, []);

  return (
    <Shell>
      <section className="login-page">
        <div className="login-z" aria-hidden>
          <svg viewBox="0 0 1000 560" preserveAspectRatio="none" role="presentation">
            <path d="M80 80 H930 L80 480 H930" />
          </svg>
        </div>

        <div className="login-card">
          <div className="login-inner">
            <Logo />
            <h1>Entre ou crie sua conta na Zeta</h1>

            <div className="switch" data-active={isCreate ? "create" : "login"}>
              <button
                type="button"
                aria-pressed={isCreate}
                onClick={() => setMode("create")}
              >
                Criar
              </button>
              <button
                type="button"
                aria-pressed={!isCreate}
                onClick={() => setMode("login")}
              >
                Entrar
              </button>
            </div>

            <form className="form">
              {isCreate ? (
                <label className="field">
                  <span>Empresa</span>
                  <input name="company" placeholder="Nome da empresa" />
                </label>
              ) : null}

              <label className="field">
                <span>Email</span>
                <input name="email" type="email" placeholder="voce@empresa.com" />
              </label>

              {!isCreate ? (
                <label className="field">
                  <span>Senha</span>
                  <input name="password" type="password" placeholder="Sua senha" />
                </label>
              ) : null}

              <button type="button" className="button">
                {isCreate ? "Criar conta" : "Entrar"} <span aria-hidden>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </Shell>
  );
}
