"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ensureSeedData, getCurrentUser, validateLogin } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@forescan.com");
  const [senha, setSenha] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureSeedData();
    if (getCurrentUser()) router.replace("/dashboard");
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = validateLogin(email.trim(), senha);
    if (!user) {
      setError("Email ou senha incorretos.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="auth-layout">
      <aside className="auth-panel">
        <div>
          <div className="auth-panel-brand">
            <img src="/images/Logo.png" alt="" />
            <span>Forescan</span>
          </div>

          <div className="auth-panel-copy">
            <h2>Gestao forense inteligente</h2>
            <p>Centralize casos, evidencias e analises preditivas em uma plataforma unificada para peritos e equipes tecnicas.</p>
          </div>

          <div className="auth-panel-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <span>Laudos e casos com rastreabilidade completa</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span>Mapa interativo com geolocalizacao dos casos</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-6 4 3 5-8" />
                </svg>
              </div>
              <span>Predicao de crimes via Machine Learning</span>
            </div>
          </div>
        </div>

        <p className="auth-panel-footer">Sistema pericial &middot; v1.0</p>
      </aside>

      <section className="auth-card">
        <div className="page-title">
          <h1>Bem-vindo de volta</h1>
          <p>Entre com suas credenciais para acessar o painel.</p>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <form className="grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" required />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="********" required />
          </label>

          <button className="primary-button auth-submit" type="submit">
            Entrar no sistema
          </button>
        </form>
      </section>
    </div>
  );
}
