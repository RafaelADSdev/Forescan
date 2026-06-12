"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatDateTime } from "@/lib/analytics";
import { deleteEvidence, getCase, getEvidencesByCase, saveEvidence } from "@/lib/storage";
import type { CaseRecord, EvidenceRecord } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function EvidencePage() {
  const params = useParams<{ id: string }>();
  const { loading } = useAuthGuard();
  const [record, setRecord] = useState<CaseRecord | null | undefined>(undefined);
  const [evidences, setEvidences] = useState<EvidenceRecord[]>([]);
  const [editing, setEditing] = useState<EvidenceRecord | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setRecord(getCase(params.id));
      setEvidences(getEvidencesByCase(params.id));
    }
  }, [loading, params.id]);

  if (loading || record === undefined) return <LoadingState />;

  if (!record) {
    return <EmptyState title="Caso nao encontrado" description="Nao foi possivel vincular evidencias a um caso inexistente." />;
  }

  function resetForm() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setPhotoDataUrl(undefined);
    setFileName(undefined);
  }

  async function handleFileChange(file?: File) {
    if (!file) {
      setPhotoDataUrl(undefined);
      setFileName(undefined);
      return;
    }
    setPhotoDataUrl(await fileToDataUrl(file));
    setFileName(file.name);
  }

  function handleEdit(item: EvidenceRecord) {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setPhotoDataUrl(item.photoDataUrl);
    setFileName(item.fileName);
  }

  function handleDelete(id: string) {
    const shouldDelete = window.confirm("Excluir esta evidencia?");
    if (!shouldDelete) return;
    deleteEvidence(id);
    setEvidences(getEvidencesByCase(params.id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMessage("Titulo e descricao sao obrigatorios.");
      return;
    }

    saveEvidence({
      id: editing?.id,
      dataCriacao: editing?.dataCriacao,
      casoId: params.id,
      title: title.trim(),
      description: description.trim(),
      photoDataUrl,
      fileName
    });

    setMessage(editing ? "Evidencia atualizada com sucesso." : "Evidencia salva com sucesso.");
    resetForm();
    setEvidences(getEvidencesByCase(params.id));
  }

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <span className="page-kicker">Evidencias</span>
          <h1>Evidencias</h1>
          <p>Gerencie evidencias vinculadas ao caso {record.nomeCaso}.</p>
        </div>
        <div className="actions-row">
          <Link className="secondary-button" href={`/casos/${record.id}`}>
            Voltar ao laudo
          </Link>
        </div>
      </header>

      <div className="two-column">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>{editing ? "Editar evidencia" : "Nova evidencia"}</h2>
          </div>
          {message ? <div className={message.includes("sucesso") ? "alert success" : "alert error"}>{message}</div> : null}

          <div className="grid">
            <label className="form-field">
              <span>Titulo</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Descricao</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Imagem</span>
              <input type="file" accept="image/*" onChange={(event) => handleFileChange(event.target.files?.[0])} />
            </label>
            {photoDataUrl ? (
              <div className="evidence-item">
                <img className="evidence-photo" src={photoDataUrl} alt="Previa da evidencia" />
                <p className="muted-text">{fileName}</p>
                <button className="secondary-button" type="button" onClick={() => handleFileChange(undefined)}>
                  Remover imagem
                </button>
              </div>
            ) : null}
          </div>

          <div className="form-actions">
            {editing ? (
              <button className="secondary-button" type="button" onClick={resetForm}>
                Cancelar edicao
              </button>
            ) : null}
            <button className="primary-button" type="submit">
              {editing ? "Atualizar evidencia" : "Salvar evidencia"}
            </button>
          </div>
        </form>

        <section className="panel">
          <div className="panel-header">
            <h2>Salvas</h2>
            <span className="muted-text">{evidences.length} item(ns)</span>
          </div>

          {evidences.length === 0 ? (
            <EmptyState title="Nenhuma evidencia salva" />
          ) : (
            <div className="evidence-list">
              {evidences.map((item) => (
                <article className="evidence-item" key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p className="muted-text">{formatDateTime(item.dataCriacao)}</p>
                  {item.photoDataUrl ? <img className="evidence-photo" src={item.photoDataUrl} alt={item.title} /> : null}
                  <div className="toolbar">
                    <button className="secondary-button" type="button" onClick={() => handleEdit(item)}>
                      Editar
                    </button>
                    <button className="danger-button" type="button" onClick={() => handleDelete(item.id)}>
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
