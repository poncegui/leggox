import React, { useEffect, useMemo, useRef, useState } from "react";

export const MANGUITOS = [
  {
    id: "manguito-127-inferior-radiador",
    title: "Manguito inferior radiador (Seat 127)",
    subtitle: "Ø15mm · espesor 5mm · 59cm x 12cm",
    dims: { lengthCm: 59, heightCm: 12, innerMm: 15, wallMm: 5 },
    sketch: require("../Assets/images/manguitos/manguito-inferior-de-radiador-seat-127.jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["seat 127", "radiador", "inferior"],
  },
  {
    id: "manguito-llenado-seat-renault-21cm",
    title: "Manguito llenado (Seat/Renault)",
    subtitle: "Ø54mm · espesor 5mm · 21cm",
    dims: { lengthCm: 21, innerMm: 54, wallMm: 5 },
    sketch: require("../Assets/images/manguitos/manguito-llenado-seat-renault.jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["llenado", "seat", "renault"],
  },
  {
    id: "manguito-llenado-seat-renault-21cm-variant",
    title: "Manguito llenado (variante)",
    subtitle: "Ø54mm · espesor 5mm · 21cm",
    dims: { lengthCm: 21, innerMm: 54, wallMm: 5 },
    sketch: require("../Assets/images/manguitos/manguito-llenado-seat-renault.jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["llenado", "variante"],
  },
  {
    id: "manguito-calefaccion-motor-radiador-127",
    title: "Manguito calefacción motor → radiador (Seat 127)",
    subtitle: "Ø35mm · espesor 5mm · 40cm",
    dims: { lengthCm: 40, innerMm: 35, wallMm: 5 },
    sketch: require("../Assets/images/manguitos/manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["calefacción", "motor", "radiador"],
  },
  {
    id: "manguito-bomba-agua-tubo-127-panda",
    title: "Manguito bomba de agua → tubo (Seat 127 / Panda)",
    subtitle: "Ø16mm · espesor 5mm · 20cm",
    dims: { lengthCm: 20, innerMm: 16, wallMm: 5 },
    sketch: require("../Assets/images/manguitos/manguito-silicona-de-bomba-de-agua-a-tubo-seat-127-panda.jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["bomba agua", "panda", "127"],
  },
  {
    id: "manguito-radiador-inferior-1430-potenciado",
    title: "Manguito radiador inferior (1430 potenciado)",
    subtitle: "—",
    dims: null,
    sketch: require("../Assets/images/manguitos/manguito-silicona-radiador-inferior-1430-potenciado.jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["1430", "radiador", "inferior"],
  },
  {
    id: "manguito-superior-radiador-panda-82",
    title: "Manguito superior radiador (Seat Panda 82)",
    subtitle: "—",
    dims: null,
    sketch: require("../Assets/images/manguitos/manguito-superior-de-radiador-para-seat-panda-año-82-4405596 (1).jpg"),
    real: null,
    slug: "61145-manguito-silicona-calefaccion-de-motor-a-radiador-seat-127.html",
    tags: ["panda", "radiador", "superior"],
  },
];

function isObj(v) {
  return v && typeof v === "object";
}
function resolveImageSrc(source) {
  if (!source) return null;
  if (typeof source === "string") return source;
  if (isObj(source) && typeof source.uri === "string") return source.uri;
  if (isObj(source) && source.default) return source.default;
  return source;
}

export default function piezasGallery({
  items = MANGUITOS,
  title = "Manguitos",
  description = "Croquis industriales + fotos reales (cuando las añadas) con zoom y compra en un clic.",
  baseUrl = "https://mercagarage.com/recambios/",
  initialView = "sketch", // "sketch" | "real"
  showSearch = true,
  showTags = true,
  buyLabel = "Ver y comprar",
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState(initialView);
  const [activeId, setActiveId] = useState(null);

  const activeItem = useMemo(
    () => items.find((x) => x.id === activeId) || null,
    [activeId, items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.title} ${it.subtitle || ""} ${(it.tags || []).join(
        " ",
      )}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  return (
    <section style={styles.section} aria-label={`${title} - galería`}>
      <header style={styles.header}>
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={styles.h2}>
            Manguitos <span style={{ fontWeight: 900 }}>Leggox</span>
          </h2>
          <p style={styles.p}>{description}</p>
        </div>

        <div style={styles.controls}>
          {showSearch && (
            <label style={styles.searchLabel}>
              <span style={styles.srOnly}>Buscar manguito</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por modelo, medida, uso…"
                style={styles.search}
                aria-label="Buscar manguito"
              />
            </label>
          )}

          <div
            style={styles.toggle}
            role="group"
            aria-label="Selector de vista"
          >
            <ToggleButton
              pressed={view === "sketch"}
              onPress={() => setView("sketch")}
              label="Croquis"
            />
            <ToggleButton
              pressed={view === "real"}
              onPress={() => setView("real")}
              label="Foto real"
            />
          </div>
        </div>
      </header>

      <div style={styles.grid} role="list" aria-label="Lista de manguitos">
        {filtered.map((it) => (
          <Card
            key={it.id}
            item={it}
            view={view}
            baseUrl={baseUrl}
            buyLabel={buyLabel}
            onOpen={() => setActiveId(it.id)}
            showTags={showTags}
          />
        ))}
      </div>

      <ZoomDialog
        item={activeItem}
        view={view}
        baseUrl={baseUrl}
        buyLabel={buyLabel}
        onClose={() => setActiveId(null)}
      />
    </section>
  );
}

function ToggleButton({ pressed, onPress, label }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={pressed}
      style={{
        ...styles.toggleBtn,
        ...(pressed ? styles.toggleBtnActive : null),
      }}
    >
      {label}
    </button>
  );
}

function Card({ item, view, baseUrl, buyLabel, onOpen, showTags }) {
  const src =
    view === "real" ? resolveImageSrc(item.real) : resolveImageSrc(item.sketch);
  const hasImage = !!src;

  return (
    <article style={styles.card} role="listitem" aria-label={item.title}>
      <button
        type="button"
        onClick={onOpen}
        style={styles.previewBtn}
        aria-label={`Abrir zoom de ${item.title}`}
      >
        <div style={styles.preview}>
          {hasImage ? (
            <img
              src={src}
              alt={item.title}
              style={styles.img}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div style={styles.missing} aria-hidden="true">
              Sin imagen ({view === "real" ? "foto real" : "croquis"})
            </div>
          )}
        </div>
      </button>

      <div style={styles.cardBody}>
        <div style={{ display: "grid", gap: 6 }}>
          <h3 style={styles.h3}>{item.title}</h3>
          {item.subtitle ? (
            <p style={styles.subtitle}>{item.subtitle}</p>
          ) : null}

          {showTags && item.tags?.length ? (
            <div style={styles.tags} aria-label="Etiquetas">
              {item.tags.slice(0, 4).map((t) => (
                <span key={t} style={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div style={styles.cardFooter}>
          <a
            href={baseUrl + item.slug}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.buy}
            aria-label={`${buyLabel}: ${item.title}`}
          >
            {buyLabel} →
          </a>

          <button type="button" onClick={onOpen} style={styles.zoomBtn}>
            Zoom
          </button>
        </div>
      </div>
    </article>
  );
}

function ZoomDialog({ item, view, baseUrl, buyLabel, onClose }) {
  const [scale, setScale] = useState(1);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  const src = useMemo(() => {
    if (!item) return null;
    return view === "real"
      ? resolveImageSrc(item.real)
      : resolveImageSrc(item.sketch);
  }, [item, view]);

  useEffect(() => {
    if (!item) return;
    setScale(1);
    requestAnimationFrame(() => closeBtnRef.current?.focus?.());
  }, [item]);

  useEffect(() => {
    const onKey = (e) => {
      if (!item) return;
      if (e.key === "Escape") onClose();
      if ((e.key === "+" || e.key === "=") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)));
      }
      if (e.key === "-" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setScale((s) => Math.max(1, +(s - 0.25).toFixed(2)));
      }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  const title = item.title;
  const buyHref = baseUrl + item.slug;

  return (
    <div
      style={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Zoom: ${title}`}
        style={styles.dialog}
      >
        <header style={styles.dialogHeader}>
          <div style={{ minWidth: 0 }}>
            <div style={styles.dialogTitle}>{title}</div>
            <div style={styles.dialogSub}>
              {view === "real" ? "Foto real" : "Croquis industrial"} · Ctrl/⌘ +
              / - para zoom
            </div>
          </div>

          <div style={styles.dialogActions}>
            <a
              href={buyHref}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.buy2}
              aria-label={`${buyLabel}: ${title}`}
            >
              {buyLabel}
            </a>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              style={styles.close}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </header>

        <div style={styles.viewer}>
          <div
            style={styles.zoomRow}
            role="group"
            aria-label="Controles de zoom"
          >
            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.max(1, +(s - 0.25).toFixed(2)))
              }
              style={styles.zBtn}
              aria-label="Reducir zoom"
            >
              −
            </button>
            <div style={styles.zoomValue} aria-live="polite">
              {Math.round(scale * 100)}%
            </div>
            <button
              type="button"
              onClick={() =>
                setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)))
              }
              style={styles.zBtn}
              aria-label="Aumentar zoom"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              style={styles.zBtn}
              aria-label="Reiniciar zoom"
            >
              100%
            </button>
          </div>

          <div style={styles.canvas}>
            {src ? (
              <img
                src={src}
                alt={title}
                style={{
                  ...styles.dialogImg,
                  transform: `scale(${scale})`,
                }}
                draggable={false}
              />
            ) : (
              <div style={styles.missingBig}>
                No hay imagen disponible en esta vista.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: {
    padding: 16,
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    color: "#111827",
  },
  header: {
    display: "grid",
    gap: 12,
    alignItems: "end",
    gridTemplateColumns: "1fr",
    marginBottom: 16,
  },
  h2: {
    margin: 0,
    fontSize: 28,
    letterSpacing: -0.4,
    fontWeight: 700,
  },
  p: { margin: 0, color: "#4B5563", lineHeight: 1.45 },
  controls: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchLabel: { flex: "1 1 320px" },
  search: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    outline: "none",
    background: "#fff",
  },
  toggle: {
    display: "inline-flex",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
  },
  toggleBtn: {
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#374151",
    fontWeight: 600,
  },
  toggleBtnActive: { background: "#111827", color: "#fff" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },

  card: {
    border: "1px solid #E5E7EB",
    borderRadius: 18,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
    display: "grid",
    gridTemplateRows: "auto 1fr",
  },
  previewBtn: {
    border: "none",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
  },
  preview: {
    aspectRatio: "4 / 3",
    background: "#F3F4F6",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  missing: { color: "#6B7280", fontWeight: 600 },

  cardBody: { padding: 12, display: "grid", gap: 12 },
  h3: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.2,
    fontWeight: 600,
    fontFamily: "APERCU, sans-serif",
  },
  subtitle: {
    margin: 0,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 1.35,
    fontFamily: "ui-monospace, monospace",
  },
  tags: { display: "flex", gap: 6, flexWrap: "wrap" },
  tag: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #E5E7EB",
    color: "#374151",
    background: "#FAFAFA",
  },

  cardFooter: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buy: {
    textDecoration: "none",
    fontWeight: 700,
    color: "#111827",
    fontFamily: "APERCU, sans-serif",
  },
  zoomBtn: {
    border: "1px solid #E5E7EB",
    background: "#fff",
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontFamily: "APERCU, sans-serif",
  },

  // Dialog
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.55)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  dialog: {
    width: "min(980px, 100%)",
    maxHeight: "min(86vh, 860px)",
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
    display: "grid",
    gridTemplateRows: "auto 1fr",
  },
  dialogHeader: {
    padding: 14,
    borderBottom: "1px solid #E5E7EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  dialogTitle: {
    fontWeight: 900,
    fontSize: 16,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontFamily: "APERCU, sans-serif",
  },
  dialogSub: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "ui-monospace, monospace",
  },
  dialogActions: { display: "flex", gap: 10, alignItems: "center" },
  buy2: {
    textDecoration: "none",
    fontWeight: 800,
    background: "#111827",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 12,
    fontFamily: "APERCU, sans-serif",
  },
  close: {
    border: "1px solid #E5E7EB",
    background: "#fff",
    width: 40,
    height: 40,
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: "40px",
  },
  viewer: { display: "grid", gridTemplateRows: "auto 1fr", minHeight: 0 },
  zoomRow: {
    padding: 12,
    borderBottom: "1px solid #E5E7EB",
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  zBtn: {
    border: "1px solid #E5E7EB",
    background: "#fff",
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    fontFamily: "APERCU, sans-serif",
  },
  zoomValue: {
    fontWeight: 800,
    color: "#111827",
    minWidth: 70,
    textAlign: "center",
  },
  canvas: {
    padding: 16,
    overflow: "auto",
    background: "#0B1220",
    display: "grid",
    placeItems: "center",
  },
  dialogImg: {
    maxWidth: "100%",
    height: "auto",
    transformOrigin: "center",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    userSelect: "none",
  },
  missingBig: {
    color: "#fff",
    fontWeight: 800,
    padding: 18,
  },

  // a11y helper
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
};
