"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/storage";
import type { User } from "@/lib/types";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    )
  },
  {
    href: "/casos/novo",
    label: "Novo caso",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    )
  },
  {
    href: "/ml",
    label: "Análise ML",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-6 4 3 5-8" />
      </svg>
    )
  },
  {
    href: "/usuarios",
    label: "Usuários",
    adminOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isLogin = pathname === "/login";

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  function handleLogout() {
    logout();
    setUser(null);
    router.replace("/login");
  }

  if (isLogin) {
    return <main className="auth-shell">{children}</main>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/dashboard" className="brand" aria-label="Forescan dashboard">
          <img src="/images/Logo.png" alt="" />
          <span>Forescan</span>
        </Link>

        <nav className="main-nav" aria-label="Navegação principal">
          {navItems
            .filter((item) => !item.adminOnly || user?.tipo === "Administrador")
            .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={isActive ? "nav-link active" : "nav-link"}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="user-area">
          {user ? (
            <>
              <span className="user-pill">{user.nome}</span>
              <button className="ghost-button" onClick={handleLogout} type="button">
                Sair
              </button>
            </>
          ) : (
            <Link className="ghost-button" href="/login">
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <span>Forescan</span>
        <span>Gestão de casos forenses</span>
      </footer>
    </div>
  );
}
