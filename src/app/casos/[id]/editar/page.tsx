"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CaseForm } from "@/components/cases/CaseForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getCase } from "@/lib/storage";
import type { CaseRecord } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function EditCasePage() {
  const params = useParams<{ id: string }>();
  const { loading } = useAuthGuard();
  const [record, setRecord] = useState<CaseRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!loading) setRecord(getCase(params.id));
  }, [loading, params.id]);

  if (loading || record === undefined) return <LoadingState />;

  if (!record) {
    return <EmptyState title="Caso nao encontrado" description="Volte ao dashboard e escolha um caso existente." />;
  }

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <span className="page-kicker">Edicao</span>
          <h1>Editar caso</h1>
          <p>Atualize os dados do caso {record.nomeCaso}.</p>
        </div>
      </header>

      <CaseForm initialCase={record} />
    </>
  );
}
