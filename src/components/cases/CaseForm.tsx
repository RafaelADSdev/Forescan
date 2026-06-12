"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { CASE_STATUSES, CRIME_TYPES, ETHNICITIES, PERITOS } from "@/lib/constants";
import { saveCase } from "@/lib/storage";
import type { CaseRecord } from "@/lib/types";

const LeafletMap = dynamic(() => import("@/components/ui/LeafletMap").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => <div className="leaflet-map-shell map-loading-placeholder" style={{ height: 360 }} aria-busy="true" />
});

interface CaseFormProps {
  initialCase?: CaseRecord | null;
}

export function CaseForm({ initialCase }: CaseFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    nomeCaso: initialCase?.nomeCaso || "",
    perito: initialCase?.perito || PERITOS[0],
    status: initialCase?.status || CASE_STATUSES[0],
    data: initialCase?.data || new Date().toISOString().slice(0, 10),
    tipoCrime: initialCase?.tipoCrime || CRIME_TYPES[0],
    etniaVitima: initialCase?.etniaVitima || ETHNICITIES[0],
    idadeVitima: initialCase?.idadeVitima?.toString() || "",
    latitude: initialCase?.latitude || "",
    longitude: initialCase?.longitude || "",
    descricao: initialCase?.descricao || "",
    observacoes: initialCase?.observacoes || ""
  });

  const isEditing = Boolean(initialCase?.id);
  const isValid = useMemo(() => form.nomeCaso.trim().length >= 3 && form.descricao.trim().length >= 8, [form.nomeCaso, form.descricao]);
  const selectedPosition = useMemo(() => {
    const lat = Number.parseFloat(form.latitude);
    const lng = Number.parseFloat(form.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [form.latitude, form.longitude]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateCoordinates(position: { lat: number; lng: number }) {
    setForm((current) => ({
      ...current,
      latitude: position.lat.toFixed(6),
      longitude: position.lng.toFixed(6)
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) {
      setMessage("Informe um nome de caso com pelo menos 3 caracteres e uma descricao mais completa.");
      return;
    }

    const saved = saveCase({
      id: initialCase?.id,
      nomeCaso: form.nomeCaso.trim(),
      perito: form.perito,
      status: form.status,
      data: form.data,
      tipoCrime: form.tipoCrime,
      etniaVitima: form.etniaVitima,
      idadeVitima: form.idadeVitima ? Number.parseInt(form.idadeVitima, 10) : null,
      latitude: form.latitude.trim(),
      longitude: form.longitude.trim(),
      descricao: form.descricao.trim(),
      observacoes: form.observacoes.trim()
    });

    setMessage(isEditing ? "Caso atualizado com sucesso." : "Caso cadastrado com sucesso.");
    router.replace(`/casos/${saved.id}`);
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      {message ? <div className={message.includes("sucesso") ? "alert success" : "alert error"}>{message}</div> : null}

      <div className="form-grid">
        <label className="form-field">
          <span>Nome do caso</span>
          <input value={form.nomeCaso} onChange={(event) => updateField("nomeCaso", event.target.value)} required />
        </label>

        <label className="form-field">
          <span>Perito responsavel</span>
          <select value={form.perito} onChange={(event) => updateField("perito", event.target.value)}>
            {PERITOS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Status</span>
          <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            {CASE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Data da pericia</span>
          <input type="date" value={form.data} onChange={(event) => updateField("data", event.target.value)} required />
        </label>

        <label className="form-field">
          <span>Tipo de crime</span>
          <select value={form.tipoCrime} onChange={(event) => updateField("tipoCrime", event.target.value)}>
            {CRIME_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Etnia da vitima</span>
          <select value={form.etniaVitima} onChange={(event) => updateField("etniaVitima", event.target.value)}>
            {ETHNICITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Idade da vitima</span>
          <input min="0" type="number" value={form.idadeVitima} onChange={(event) => updateField("idadeVitima", event.target.value)} />
        </label>

        <div className="form-field full map-field">
          <span>Localizacao do caso</span>
          <div className="coordinate-grid">
            <label className="coordinate-input">
              <span>Latitude</span>
              <input aria-label="Latitude" placeholder="-8.054280" value={form.latitude} onChange={(event) => updateField("latitude", event.target.value)} />
            </label>
            <label className="coordinate-input">
              <span>Longitude</span>
              <input aria-label="Longitude" placeholder="-34.881300" value={form.longitude} onChange={(event) => updateField("longitude", event.target.value)} />
            </label>
          </div>
          <LeafletMap
            selectedPosition={selectedPosition}
            onPositionChange={updateCoordinates}
            height={360}
            label="Clique no mapa para definir as coordenadas do caso."
          />
        </div>

        <label className="form-field full">
          <span>Descricao do exame</span>
          <textarea value={form.descricao} onChange={(event) => updateField("descricao", event.target.value)} required />
        </label>

        <label className="form-field full">
          <span>Observacoes</span>
          <textarea value={form.observacoes} onChange={(event) => updateField("observacoes", event.target.value)} />
        </label>
      </div>

      <div className="form-actions">
        <Link className="secondary-button" href="/dashboard">
          Cancelar
        </Link>
        <button className="primary-button" type="submit">
          {isEditing ? "Atualizar caso" : "Cadastrar caso"}
        </button>
      </div>
    </form>
  );
}
