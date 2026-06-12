"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMapInstance, Marker } from "leaflet";
import type { CaseRecord } from "@/lib/types";

type LeafletModule = typeof import("leaflet");

interface MapPosition {
  lat: number;
  lng: number;
}

interface MapPoint extends MapPosition {
  id: string;
  title: string;
  detail: string;
  status: string;
}

interface LeafletMapProps {
  cases?: CaseRecord[];
  selectedPosition?: MapPosition | null;
  onPositionChange?: (position: MapPosition) => void;
  height?: number;
  label?: string;
}

const DEFAULT_CENTER: MapPosition = { lat: -8.05428, lng: -34.8813 };
const PICKER_ZOOM = 12;
const OVERVIEW_ZOOM = 11;
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const TILE_SUBDOMAINS = "abcd";

function toNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCasePoint(record: CaseRecord): MapPoint | null {
  const lat = toNumber(record.latitude);
  const lng = toNumber(record.longitude);
  if (lat === null || lng === null) return null;

  return {
    id: record.id,
    lat,
    lng,
    title: record.nomeCaso,
    detail: record.tipoCrime,
    status: record.status
  };
}

function isValidPosition(position: MapPosition | null | undefined): position is MapPosition {
  return Boolean(position && Number.isFinite(position.lat) && Number.isFinite(position.lng));
}

function createMarkerIcon(leaflet: LeafletModule, selected = false) {
  return leaflet.divIcon({
    className: "forescan-map-marker-wrap",
    html: `<span class="forescan-map-marker${selected ? " selected" : ""}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
}

function createPopup(point: MapPoint) {
  const root = document.createElement("div");
  root.className = "map-popup";

  const title = document.createElement("strong");
  title.textContent = point.title;
  root.appendChild(title);

  const detail = document.createElement("span");
  detail.textContent = point.detail;
  root.appendChild(detail);

  const status = document.createElement("small");
  status.textContent = point.status;
  root.appendChild(status);

  return root;
}

function canInvalidateMap(map: LeafletMapInstance | null) {
  if (!map) return false;

  const container = map.getContainer();
  if (!container || !container.isConnected) return false;

  const mapPane = container.querySelector(".leaflet-map-pane");
  return Boolean(mapPane);
}

function safeInvalidateSize(map: LeafletMapInstance | null) {
  if (!canInvalidateMap(map)) return;

  try {
    map!.invalidateSize({ animate: false, pan: false });
  } catch {
    // Mapa removido entre a checagem e a chamada (React Strict Mode / unmount).
  }
}

export function LeafletMap({ cases = [], selectedPosition = null, onPositionChange, height = 300, label }: LeafletMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const selectedMarkerRef = useRef<Marker | null>(null);
  const positionChangeRef = useRef(onPositionChange);
  const timersRef = useRef<number[]>([]);
  const aliveRef = useRef(false);
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [ready, setReady] = useState(false);

  const isPicker = Boolean(onPositionChange);
  const points = useMemo(() => cases.map(toCasePoint).filter((point): point is MapPoint => Boolean(point)), [cases]);
  const hasSelectedPosition = isValidPosition(selectedPosition);

  useEffect(() => {
    positionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimer: number | null = null;
    const container = containerRef.current;

    const scheduleInvalidate = () => {
      window.requestAnimationFrame(() => {
        if (!aliveRef.current || cancelled) return;
        safeInvalidateSize(mapRef.current);
      });

      const timerId = window.setTimeout(() => {
        if (!aliveRef.current || cancelled) return;
        safeInvalidateSize(mapRef.current);
      }, 150);

      timersRef.current.push(timerId);
    };

    const clearTimers = () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
        resizeTimer = null;
      }
    };

    if (!container) {
      return () => {
        clearTimers();
      };
    }

    aliveRef.current = true;

    void import("leaflet").then((module) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = module.map(containerRef.current, {
        attributionControl: true,
        scrollWheelZoom: false,
        zoomControl: true
      });

      map.on("mouseout", () => {
        map.scrollWheelZoom.disable();
      });

      module
        .tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
          subdomains: TILE_SUBDOMAINS,
          maxZoom: 19,
          detectRetina: true
        })
        .addTo(map);

      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], isPicker ? PICKER_ZOOM : OVERVIEW_ZOOM);

      mapRef.current = map;
      layerRef.current = module.layerGroup().addTo(map);
      setLeaflet(module);

      map.on("click", (event) => {
        map.scrollWheelZoom.enable();

        const handler = positionChangeRef.current;
        if (!handler) return;

        handler({
          lat: Number(event.latlng.lat.toFixed(6)),
          lng: Number(event.latlng.lng.toFixed(6))
        });
      });

      map.whenReady(() => {
        if (cancelled || !aliveRef.current) return;
        scheduleInvalidate();
        setReady(true);
      });

      if (shellRef.current && "ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(() => {
          if (!aliveRef.current || cancelled) return;
          if (resizeTimer !== null) window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => {
            safeInvalidateSize(mapRef.current);
          }, 100);
        });
        resizeObserver.observe(shellRef.current);
      }
    });

    return () => {
      cancelled = true;
      aliveRef.current = false;
      clearTimers();
      resizeObserver?.disconnect();

      selectedMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setLeaflet(null);
      setReady(false);
    };
  }, [isPicker]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || !layerRef.current || !ready || !aliveRef.current) return;

    const map = mapRef.current;
    const layer = layerRef.current;

    layer.clearLayers();
    selectedMarkerRef.current = null;

    points.forEach((point) => {
      leaflet.marker([point.lat, point.lng], { icon: createMarkerIcon(leaflet) }).bindPopup(createPopup(point)).addTo(layer);
    });

    if (hasSelectedPosition) {
      selectedMarkerRef.current = leaflet
        .marker([selectedPosition.lat, selectedPosition.lng], { icon: createMarkerIcon(leaflet, true) })
        .bindTooltip(isPicker ? "Local selecionado" : "Coordenada selecionada")
        .addTo(layer);
    }

    if (isPicker) {
      if (hasSelectedPosition) {
        map.setView([selectedPosition.lat, selectedPosition.lng], Math.max(map.getZoom(), PICKER_ZOOM), { animate: false });
      }
      return;
    }

    const bounds: Array<[number, number]> = points.map((point) => [point.lat, point.lng]);
    if (hasSelectedPosition) bounds.push([selectedPosition.lat, selectedPosition.lng]);

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14, animate: false });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13, { animate: false });
    } else {
      map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], OVERVIEW_ZOOM, { animate: false });
    }
  }, [hasSelectedPosition, isPicker, leaflet, points, ready, selectedPosition]);

  return (
    <div className="leaflet-map-wrapper">
      <div className="leaflet-map-shell" ref={shellRef} style={{ height }}>
        <div className={`leaflet-map-host${isPicker ? " is-picker" : ""}`} ref={containerRef} />
        {isPicker ? (
          <div className="map-picker-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Clique para marcar
          </div>
        ) : null}
        {!isPicker && points.length === 0 && !hasSelectedPosition ? (
          <div className="map-empty-overlay">Nenhuma coordenada registrada.</div>
        ) : null}
      </div>
      {label ? <p className="map-hint">{label}</p> : null}
    </div>
  );
}
