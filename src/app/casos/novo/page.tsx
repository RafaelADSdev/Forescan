"use client";

import { CaseForm } from "@/components/cases/CaseForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function NewCasePage() {
  const { loading } = useAuthGuard();

  if (loading) return <LoadingState />;

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <span className="page-kicker">Cadastro</span>
          <h1>Adicionar caso</h1>
          <p>Registre os dados principais do caso, vitima, perito responsavel, localizacao e descricao do exame.</p>
        </div>
      </header>

      <CaseForm />
    </>
  );
}
