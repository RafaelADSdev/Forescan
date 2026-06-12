"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CASE_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/analytics";
import { deleteCase, getCase, getEvidencesByCase, roleCanManageStatus, saveCase } from "@/lib/storage";
import type { CaseRecord, CaseStatus, EvidenceRecord } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuthGuard();
  const [record, setRecord] = useState<CaseRecord | null | undefined>(undefined);
  const [evidences, setEvidences] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    if (!loading) {
      setRecord(getCase(params.id));
      setEvidences(getEvidencesByCase(params.id));
    }
  }, [loading, params.id]);

  if (loading || record === undefined) return <LoadingState />;

  if (!record) {
    return <EmptyState title="Caso nao encontrado" description="O registro pode ter sido removido ou nao existe no armazenamento local." />;
  }

  function handleStatusChange(status: CaseStatus) {
    if (!record) return;
    const next = saveCase({ ...record, status });
    setRecord(next);
  }

  function handleDelete() {
    if (!record) return;
    const shouldDelete = window.confirm("Tem certeza que deseja excluir este caso?");
    if (!shouldDelete) return;
    deleteCase(record.id);
    router.replace("/dashboard");
  }

  return (
    <>
      <header className="page-header no-print">
        <div className="page-title">
          <span className="page-kicker">Laudo</span>
          <h1>{record.nomeCaso}</h1>
          <p>Laudo e dados detalhados do caso.</p>
        </div>
        <div className="actions-row">
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            Imprimir / PDF
          </button>
          <Link className="secondary-button" href={`/casos/${record.id}/editar`}>
            Editar
          </Link>
          <Link className="secondary-button" href={`/casos/${record.id}/evidencias`}>
            Evidencias
          </Link>
          <button className="danger-button" type="button" onClick={handleDelete}>
            Excluir
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Laudo pericial</h2>
            <p className="muted-text">ID {record.id}</p>
          </div>
          <StatusBadge status={record.status} />
        </div>

        {roleCanManageStatus(user?.tipo) ? (
          <label className="form-field status-control no-print">
            <span>Alterar status</span>
            <select value={record.status} onChange={(event) => handleStatusChange(event.target.value as CaseStatus)}>
              {CASE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="detail-grid">
          <div className="detail-item">
            <span>Data da pericia</span>
            {formatDate(record.data)}
          </div>
          <div className="detail-item">
            <span>Perito responsavel</span>
            {record.perito}
          </div>
          <div className="detail-item">
            <span>Tipo de crime</span>
            {record.tipoCrime}
          </div>
          <div className="detail-item">
            <span>Idade da vitima</span>
            {record.idadeVitima ?? "N/A"}
          </div>
          <div className="detail-item">
            <span>Etnia da vitima</span>
            {record.etniaVitima}
          </div>
          <div className="detail-item">
            <span>Localizacao</span>
            {record.latitude && record.longitude ? `${record.latitude}, ${record.longitude}` : "N/A"}
          </div>
          <div className="detail-item full">
            <span>Criado em</span>
            {formatDateTime(record.createdAt)}
          </div>
          <div className="detail-item full">
            <span>Atualizado em</span>
            {formatDateTime(record.updatedAt)}
          </div>
        </div>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <h2>Descricao do exame</h2>
        </div>
        <p>{record.descricao}</p>
        {record.observacoes ? (
          <>
            <h3>Observacoes</h3>
            <p>{record.observacoes}</p>
          </>
        ) : null}
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <h2>Evidencias</h2>
          <span className="muted-text">{evidences.length} item(ns)</span>
        </div>
        {evidences.length === 0 ? (
          <EmptyState title="Nenhuma evidencia vinculada" />
        ) : (
          <div className="evidence-list">
            {evidences.map((item) => (
              <article className="evidence-item" key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p className="muted-text">Registrada em {formatDateTime(item.dataCriacao)}</p>
                {item.photoDataUrl ? <img className="evidence-photo" src={item.photoDataUrl} alt={item.title} /> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
