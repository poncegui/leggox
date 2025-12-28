import React, { useEffect, useMemo, useRef, useState } from "react";
import { PRODUCTS_DATA } from "../data/products.js";
// Importar imágenes de coches
import seat600 from "../Assets/images/coches/seat-600.png";
import seat127 from "../Assets/images/coches/seat-128.png";
import seat128 from "../Assets/images/coches/seat-128.png";
import seat131 from "../Assets/images/coches/seat-131.png";
import seat124 from "../Assets/images/coches/seat-124-biarbol.png";
import seatPanda from "../Assets/images/coches/seat-panda.png";
import seatMarbella from "../Assets/images/coches/seat-marbella.png";
import seat1430 from "../Assets/images/coches/seat-131-biarbol.png";
import seatBocanegra from "../Assets/images/coches/seat-bocanegra.png";
import seatRanchera from "../Assets/images/coches/seat-ranchera.png";
import otros from "../Assets/images/coches/otros.png";

const COLORS = {
  bg: "#000000",
  ink: "#FFFFFF",
  ink70: "rgba(255,255,255,0.70)",
  ink40: "rgba(255,255,255,0.40)",
  ink20: "rgba(255,255,255,0.20)",
  ink10: "rgba(255,255,255,0.10)",
  panel: "rgba(224,30,55,0.12)",
  red: "#E01E37",
};

const COLLECTION_NAME = "CATÁLOGO LEGGOX";
const COLLECTION_TAGLINE = "BUSCA POR MODELO DE VEHÍCULO";

/** 🔻 DATOS: Transformar PRODUCTS_DATA en arrays específicos */
const MANGUITOS = PRODUCTS_DATA.filter(
  (p) => p.type === "manguito" && p.featured,
).map((p) => ({
  id: p.id,
  type: p.type,
  title: p.title,
  subtitle: p.subtitle,
  price: p.price,
  inStock: p.inStock,
  buyUrl: p.buyUrl || `https://mercagarage.com/recambios/${p.reference}`,
  slug: p.reference,
  sku: p.reference,
  images: {
    sketch: p.imageSrc,
    real: p.imageLargeSrc,
  },
  vehicles: p.vehicles || [],
  tags: p.tags || [],
}));

const RADIADORES = PRODUCTS_DATA.filter(
  (p) => p.type === "radiador" && p.featured,
).map((p) => ({
  id: p.id,
  type: p.type,
  title: p.title,
  subtitle: p.subtitle,
  price: p.price,
  oldPrice: p.oldPrice,
  onSale: p.onSale,
  inStock: p.inStock,
  buyUrl: p.buyUrl || `https://mercagarage.com/recambios/${p.reference}`,
  slug: p.reference,
  sku: p.reference,
  images: {
    sketch: p.imageSrc,
    real: p.imageLargeSrc,
  },
  vehicles: p.vehicles || [],
  tags: p.tags || [],
}));

// Extraer modelos únicos de los vehículos
const uniqueModels = [
  ...new Set(PRODUCTS_DATA.flatMap((p) => p.vehicles || [])),
];

// Mapeo de modelos a imágenes de coches
const MODEL_IMAGES = {
  "SEAT 600": seat600,
  "SEAT 127": seat127,
  "SEAT 128": seat128,
  "SEAT 131": seat131,
  "SEAT 124": seat124,
  "SEAT 124 Sport": seatBocanegra,
  "SEAT Panda": seatPanda,
  "SEAT Marbella": seatMarbella,
  "SEAT 1430": seat1430,
  "SEAT FL/1430": seat1430,
  "SEAT 124/1430": seat124,
  "SEAT Fura": seatRanchera,
  SEAT: otros,
  Otros: otros,
};

const MODELOS = uniqueModels
  .filter((modelName) => modelName !== "Otros") // Excluir 'Otros' del array dinámico
  .map((modelName, idx) => {
    return {
      id: `model-${idx}`,
      title: modelName,
      subtitle: `Piezas compatibles con ${modelName}`,
      vehicles: [modelName],
      images: {
        sketch: MODEL_IMAGES[modelName] || seat600, // Fallback a SEAT 600
      },
    };
  });

// Añadir modelo "Otros" manualmente al final
MODELOS.push({
  id: "model-otros",
  title: "Otros",
  subtitle: "Otros modelos compatibles",
  vehicles: ["Otros"],
  images: {
    sketch: otros,
  },
});

/** Utils */
function makeBuyUrl(item) {
  if (item.buyUrl) return item.buyUrl;
  return `https://mercagarage.com/recambios/${item.slug}`;
}

function norm(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** RN-like primitives */
function Container({ children, style }) {
  return <div style={{ ...styles.container, ...style }}>{children}</div>;
}
function Row({ children, style }) {
  return <div style={{ ...styles.row, ...style }}>{children}</div>;
}
function Column({ children, style }) {
  return <div style={{ ...styles.col, ...style }}>{children}</div>;
}
function Text({ children, style }) {
  return <div style={{ ...styles.text, ...style }}>{children}</div>;
}
function Mono({ children, style }) {
  return <div style={{ ...styles.mono, ...style }}>{children}</div>;
}
function Button({ children, onPress, disabled, style, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onPress}
      aria-label={ariaLabel}
      style={{
        ...styles.button,
        ...(disabled ? styles.buttonDisabled : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function TabButton({ active, label, onPress, count }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={active}
      style={{
        ...styles.tab,
        ...(active ? styles.tabActive : {}),
      }}
    >
      <span>{label}</span>
      <span style={styles.tabCount}>{count}</span>
    </button>
  );
}

/** Modelo card: SOLO selecciona (sin links) */
function ModelCard({ item, onSelect }) {
  const sketch = item?.images?.sketch;

  return (
    <article
      role="listitem"
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "rgba(255,255,255,0.6)",
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-label={`Seleccionar modelo ${item.title}`}
        style={{
          width: "100%",
          textAlign: "left",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            aspectRatio: "4 / 3",
            width: "100%",
            background: "rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {sketch ? (
            <img
              src={sketch}
              alt={item.subtitle || item.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "#999",
              }}
            >
              Sin imagen
            </div>
          )}
        </div>

        <div
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              fontFamily: "APERCU, sans-serif",
              fontWeight: 700,
              color: "#000",
            }}
          >
            {item.title}
          </h3>
        </div>
      </button>
    </article>
  );
}

function ProductCard({ item, onSelect, isMobile }) {
  const sketch = item?.images?.sketch;
  const real = item?.images?.real;
  const cover = sketch || real;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      style={{
        ...styles.card,
        padding: isMobile ? 12 : 14,
      }}
      aria-label={`Abrir ficha de ${item.title}`}
    >
      <Row style={{ gap: 12, alignItems: "center" }}>
        <div
          style={{
            ...styles.thumb,
            width: isMobile ? 64 : 72,
            height: isMobile ? 64 : 72,
          }}
          aria-hidden="true"
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ ...styles.thumbFallback }}>IMG</div>
          )}
        </div>

        <Column style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text
            style={{
              fontSize: isMobile ? 15 : 16,
              fontWeight: 800,
              color: "#000000",
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#666666",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.subtitle || "—"}
          </Text>
          <Mono style={{ fontSize: 11, color: "#999999" }}>
            {item.sku ? `SKU ${item.sku}` : item.type?.toUpperCase()}
          </Mono>
        </Column>

        <div
          style={{ ...styles.chev, color: "#000000", borderColor: "#CCCCCC" }}
          aria-hidden="true"
        >
          →
        </div>
      </Row>
    </button>
  );
}

function ZoomImage({ src, alt, isMobile }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={styles.zoomBtn}
        aria-label={`Ampliar imagen: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: isMobile ? 220 : 280,
            objectFit: "contain",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            border: `1px solid ${COLORS.ink10}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            borderRadius: 8,
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <IconZoomIn size={16} color="#FFFFFF" />
        </div>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen ampliada"
          style={styles.modal}
          onClick={() => setOpen(false)}
        >
          <div style={styles.modalInner} onClick={(e) => e.stopPropagation()}>
            <Row
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Mono style={{ fontSize: 12, color: COLORS.ink70 }}>{alt}</Mono>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={styles.close}
                aria-label="Cerrar visor"
              >
                ✕
              </button>
            </Row>
            <div style={{ marginTop: 12 }}>
              <img
                src={src}
                alt={alt}
                style={{
                  width: "100%",
                  height: "70vh",
                  objectFit: "contain",
                  borderRadius: 16,
                  border: `1px solid ${COLORS.ink10}`,
                  background: "rgba(0,0,0,0.6)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icono SVG elegante de lupa (igual que ProductShowcase)
function IconZoomIn({ size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export default function BuscadorPiezas({ onSelectedChange }) {
  // tabs: "modelos" | "piezas"
  const [tab, setTab] = useState("modelos");
  const [typeFilter, setTypeFilter] = useState("todos"); // "todos" | "manguito" | "radiador"
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAllModels, setShowAllModels] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 480;

  const isMatch = (itemVehicles, modelVehicles) =>
    Array.isArray(itemVehicles) &&
    Array.isArray(modelVehicles) &&
    itemVehicles.some((v) => modelVehicles.includes(v));

  const allPiecesForModel = useMemo(() => {
    if (!selectedModel) return [];
    const mang = MANGUITOS.filter((m) =>
      isMatch(m.vehicles, selectedModel.vehicles),
    );
    const rad = RADIADORES.filter((r) =>
      isMatch(r.vehicles, selectedModel.vehicles),
    );
    return [...mang, ...rad];
  }, [selectedModel]);

  const piecesByType = useMemo(() => {
    if (typeFilter === "manguito")
      return allPiecesForModel.filter((p) => p.type === "manguito");
    if (typeFilter === "radiador")
      return allPiecesForModel.filter((p) => p.type === "radiador");
    return allPiecesForModel;
  }, [allPiecesForModel, typeFilter]);

  const filteredPieces = useMemo(() => {
    const nq = norm(q);
    if (!nq) return piecesByType;
    return piecesByType.filter((item) => {
      const hay = [
        item.title,
        item.subtitle,
        item.sku,
        item.slug,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .map(norm)
        .join(" ");
      return hay.includes(nq);
    });
  }, [q, piecesByType]);

  useEffect(() => {
    if (onSelectedChange) onSelectedChange(selected);
  }, [selected, onSelectedChange]);

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setTab("piezas");
    setTypeFilter("todos");
    setQ("");
    setTimeout(() => inputRef.current?.focus?.(), 0);
  };

  const counts = useMemo(() => {
    const totalManguitos = MANGUITOS.length;
    const totalRadiadores = RADIADORES.length;
    const totalPiezas = totalManguitos + totalRadiadores;

    const mangForModel = selectedModel
      ? MANGUITOS.filter((m) => isMatch(m.vehicles, selectedModel.vehicles))
          .length
      : 0;
    const radForModel = selectedModel
      ? RADIADORES.filter((r) => isMatch(r.vehicles, selectedModel.vehicles))
          .length
      : 0;

    return {
      totalManguitos,
      totalRadiadores,
      totalPiezas,
      modelManguitos: mangForModel,
      modelRadiadores: radForModel,
      modelTotal: mangForModel + radForModel,
    };
  }, [selectedModel]);

  /** ----------- FICHA PRODUCTO (igual que antes) ----------- */
  if (selected) {
    const buyUrl = makeBuyUrl(selected);
    const hasSketch = Boolean(selected?.images?.sketch);
    const hasReal = Boolean(selected?.images?.real);

    return (
      <div
        style={{
          ...styles.page,
          minHeight: isMobile ? "auto" : "100vh",
          paddingBottom: isMobile ? 40 : 0,
        }}
      >
        <Container
          style={{
            padding: isSmall ? 12 : isMobile ? 16 : 20,
            paddingTop: isSmall ? 18 : isMobile ? 22 : 28,
          }}
        >
          <Column style={{ gap: 16 }}>
            <Row
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Column style={{ gap: 6 }}>
                <Mono
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.8,
                    color: COLORS.ink70,
                  }}
                >
                  {COLLECTION_NAME} · PIEZA
                </Mono>
                <Text
                  style={{
                    fontSize: isMobile ? 22 : 30,
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    lineHeight: 1.1,
                  }}
                >
                  {selected.title}
                </Text>
                <Text style={{ color: COLORS.ink70, fontSize: 13 }}>
                  {selected.subtitle || "—"}
                </Text>
              </Column>

              <Button
                onPress={() => setSelected(null)}
                style={{
                  backgroundColor: "transparent",
                  color: COLORS.ink,
                  border: `1px solid ${COLORS.ink20}`,
                }}
                ariaLabel="Volver a resultados"
              >
                ← Volver
              </Button>
            </Row>

            <div style={styles.line} />

            <div
              style={{
                ...styles.main,
                padding: isMobile ? 14 : 18,
                borderRadius: isMobile ? 18 : 22,
              }}
            >
              <Column style={{ gap: 14 }}>
                <Row
                  style={{
                    gap: 12,
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  {hasSketch && (
                    <Column style={{ flex: 1, gap: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: 800 }}>
                        Croquis (instalación/medidas)
                      </Text>
                      <ZoomImage
                        src={selected.images.sketch}
                        alt={`Croquis de ${selected.title}`}
                        isMobile={isMobile}
                      />
                    </Column>
                  )}

                  {hasReal && (
                    <Column style={{ flex: 1, gap: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: 800 }}>
                        Foto real
                      </Text>
                      <ZoomImage
                        src={selected.images.real}
                        alt={`Foto real de ${selected.title}`}
                        isMobile={isMobile}
                      />
                    </Column>
                  )}
                </Row>

                <div style={styles.hr} />

                <Row
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <Column style={{ gap: 6 }}>
                    <Mono style={{ fontSize: 12, color: COLORS.ink70 }}>
                      {selected.sku
                        ? `SKU ${selected.sku}`
                        : `ID ${selected.id}`}
                    </Mono>
                    <Mono style={{ fontSize: 12, color: COLORS.ink40 }}>
                      Tags:{" "}
                      {(selected.tags || []).slice(0, 6).join(" · ") || "—"}
                    </Mono>
                  </Column>

                  <a
                    href={buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.buyLink}
                    aria-label={`Comprar ${selected.title} en Mercagarage (se abre en una pestaña nueva)`}
                  >
                    Comprar en Mercagarage ↗
                  </a>
                </Row>
              </Column>
            </div>
          </Column>
        </Container>
      </div>
    );
  }

  /** ----------- UI PRINCIPAL ----------- */
  const showModelPicker = tab === "modelos" || !selectedModel;

  return (
    <div
      style={{
        ...styles.page,
        minHeight: isMobile ? "auto" : "100vh",
        paddingBottom: isMobile ? 40 : 0,
      }}
    >
      <Container
        style={{
          padding: isSmall ? 12 : isMobile ? 16 : 20,
          paddingTop: isSmall ? 18 : isMobile ? 22 : 28,
          paddingBottom: isSmall ? 26 : isMobile ? 34 : 40,
        }}
      >
        <Column style={{ gap: 16 }}>
          <Mono
            style={{ fontSize: 11, letterSpacing: 0.8, color: COLORS.ink70 }}
          >
            {COLLECTION_NAME}
          </Mono>

          <Text
            style={{
              fontSize: isSmall ? 22 : isMobile ? 30 : 44,
              fontWeight: 400,
              letterSpacing: -1.0,
              lineHeight: 1.05,
            }}
          >
            {COLLECTION_TAGLINE}
          </Text>

          <div style={styles.line} />

          {/* Totales globales */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${COLORS.ink20}`,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "10px 12px",
            }}
            aria-label="Totales del catálogo"
          >
            <Mono style={{ fontSize: 12, color: COLORS.ink70 }}>
              Total piezas:{" "}
              <span style={{ color: COLORS.ink }}>{counts.totalPiezas}</span>
            </Mono>
            <Row style={{ gap: 10, flexWrap: "wrap" }}>
              <Mono style={{ fontSize: 12, color: COLORS.ink70 }}>
                Manguitos:{" "}
                <span style={{ color: COLORS.ink }}>
                  {counts.totalManguitos}
                </span>
              </Mono>
              <Mono style={{ fontSize: 12, color: COLORS.ink70 }}>
                Radiadores:{" "}
                <span style={{ color: COLORS.ink }}>
                  {counts.totalRadiadores}
                </span>
              </Mono>
            </Row>
          </div>

          {/* Si NO hay modelo o estás en picker */}
          {showModelPicker ? (
            <>
              <div
                role="region"
                aria-label="Selector de modelos"
                style={{
                  ...styles.main,
                  padding: isMobile ? 12 : 16,
                  borderRadius: isMobile ? 18 : 22,
                }}
              >
                <Text style={{ fontWeight: 900, marginBottom: 10 }}>
                  Selecciona tu modelo
                </Text>

                <div
                  role="list"
                  aria-label="Lista de modelos"
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                  }}
                >
                  {(isMobile && !showAllModels
                    ? MODELOS.slice(0, 4)
                    : MODELOS
                  ).map((m) => (
                    <ModelCard
                      key={m.id}
                      item={m}
                      onSelect={handleSelectModel}
                    />
                  ))}
                </div>

                {isMobile && !showAllModels && MODELOS.length > 4 && (
                  <Button
                    onPress={() => setShowAllModels(true)}
                    style={{
                      marginTop: 16,
                      backgroundColor: "#E01E37",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "14px 24px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                    ariaLabel="Ver todos los modelos"
                  >
                    Ver todos los modelos ({MODELOS.length - 4} más)
                  </Button>
                )}

                {isMobile && showAllModels && (
                  <Button
                    onPress={() => setShowAllModels(false)}
                    style={{
                      marginTop: 16,
                      backgroundColor: "transparent",
                      color: "#FFFFFF",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "14px 24px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                    ariaLabel="Ver menos modelos"
                  >
                    Ver menos
                  </Button>
                )}
              </div>
            </>
          ) : (
            /** ✅ MODO SUPER BUSCADOR (modelo fijo + piezas) */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "360px 1fr",
                gap: 14,
                alignItems: "stretch",
              }}
            >
              {/* Panel fijo modelo */}
              <aside
                role="region"
                aria-label="Modelo seleccionado"
                style={{
                  ...styles.main,
                  padding: 14,
                  borderRadius: 18,
                  position:
                    typeof window !== "undefined" && !isMobile
                      ? "sticky"
                      : "relative",
                  top: typeof window !== "undefined" && !isMobile ? 18 : "auto",
                }}
              >
                <Column style={{ gap: 10 }}>
                  <Row
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div>
                      <Mono
                        style={{
                          fontSize: 11,
                          color: "#666666",
                          letterSpacing: 0.8,
                        }}
                      >
                        MODELO SELECCIONADO
                      </Mono>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          marginTop: 4,
                          color: "#000000",
                        }}
                      >
                        {selectedModel.title}
                      </Text>
                      <Mono
                        style={{
                          fontSize: 12,
                          color: "#666666",
                          marginTop: 6,
                        }}
                      >
                        Piezas:{" "}
                        <span style={{ color: "#000000" }}>
                          {counts.modelTotal}
                        </span>{" "}
                        <span style={{ color: "#999999" }}>
                          · Manguitos {counts.modelManguitos} · Radiadores{" "}
                          {counts.modelRadiadores}
                        </span>
                      </Mono>
                    </div>

                    <Button
                      onPress={() => {
                        setSelectedModel(null);
                        setTab("modelos");
                        setQ("");
                      }}
                      style={{
                        backgroundColor: "#F5F5F5",
                        color: "#666666",
                        border: "1px solid #E0E0E0",
                        padding: "10px 12px",
                      }}
                      ariaLabel="Cambiar modelo"
                    >
                      Cambiar
                    </Button>
                  </Row>

                  <div
                    style={{ height: 1, backgroundColor: "rgba(0,0,0,0.1)" }}
                  />

                  {/* ✅ IMAGEN FIJA (solo imagen, sin link) */}
                  <div
                    style={{
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.1)",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    {selectedModel?.title === "Otros" ? (
                      <img
                        src={otros}
                        alt="Vista técnica de otros modelos"
                        style={{
                          width: "100%",
                          height: isMobile ? 220 : 260,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : selectedModel?.images?.sketch ? (
                      <img
                        src={selectedModel.images.sketch}
                        alt={`Imagen del modelo ${selectedModel.title}`}
                        style={{
                          width: "100%",
                          height: isMobile ? 220 : 260,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 220,
                          display: "grid",
                          placeItems: "center",
                          color: COLORS.ink40,
                        }}
                      >
                        Sin imagen
                      </div>
                    )}
                  </div>
                </Column>
              </aside>

              {/* Panel resultados piezas */}
              <section
                aria-label="Resultados de piezas"
                style={{
                  ...styles.main,
                  padding: isMobile ? 16 : 20,
                  borderRadius: 18,
                }}
              >
                <Column style={{ gap: 12 }}>
                  {/* Filtros */}
                  <Row
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Text style={{ fontWeight: 900, color: "#000000" }}>
                      Piezas compatibles
                    </Text>

                    <div
                      style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                      role="tablist"
                      aria-label="Filtro por tipo de pieza"
                    >
                      <TabButton
                        active={typeFilter === "todos"}
                        label="Todas"
                        count={allPiecesForModel.length}
                        onPress={() => setTypeFilter("todos")}
                      />
                      <TabButton
                        active={typeFilter === "manguito"}
                        label="Manguitos"
                        count={counts.modelManguitos}
                        onPress={() => setTypeFilter("manguito")}
                      />
                      <TabButton
                        active={typeFilter === "radiador"}
                        label="Radiadores"
                        count={counts.modelRadiadores}
                        onPress={() => setTypeFilter("radiador")}
                      />
                    </div>
                  </Row>

                  <div
                    style={{ height: 1, backgroundColor: "rgba(0,0,0,0.1)" }}
                  />

                  {/* Resultados */}
                  {filteredPieces.length === 0 ? (
                    <Column style={{ gap: 8, padding: 10 }}>
                      <Text style={{ fontWeight: 800, color: "#000000" }}>
                        No hay resultados
                      </Text>
                      <Text style={{ color: "#666666", fontSize: 13 }}>
                        Prueba con otra palabra (“silicona”, “superior”, “doble
                        núcleo”…).
                      </Text>
                    </Column>
                  ) : (
                    <div
                      role="list"
                      aria-label="Lista de piezas"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {filteredPieces.map((item) => (
                        <div role="listitem" key={item.id}>
                          <ProductCard
                            item={item}
                            onSelect={setSelected}
                            isMobile={isMobile}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Column>
              </section>
            </div>
          )}
        </Column>
      </Container>
    </div>
  );
}

/** Styles */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: COLORS.bg,
    color: COLORS.ink,
  },
  container: {
    width: "100%",
    maxWidth: 1120,
    margin: "0 auto",
    padding: 20,
  },
  row: { display: "flex", flexDirection: "row" },
  col: { display: "flex", flexDirection: "column" },
  text: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 14,
    lineHeight: 1.6,
    color: COLORS.ink70,
  },
  line: {
    height: 3,
    width: 360,
    maxWidth: "70vw",
    backgroundColor: COLORS.red,
  },
  main: {
    borderRadius: 22,
    border: "1px solid rgba(0,0,0,0.12)",
    backgroundColor: "#FFFFFF",
  },
  hr: {
    height: 1,
    backgroundColor: COLORS.ink10,
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#666666",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  },
  input: {
    width: "100%",
    borderRadius: 14,
    border: `1px solid ${COLORS.ink20}`,
    outline: "none",
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  button: {
    borderRadius: 999,
    border: `1px solid ${COLORS.ink}`,
    backgroundColor: COLORS.ink,
    color: COLORS.bg,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  buttonDisabled: { opacity: 0.35, cursor: "not-allowed" },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.2)",
    backgroundColor: "rgba(0,0,0,0.04)",
    color: "#000000",
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 900,
  },
  tabActive: {
    backgroundColor: "#000000",
    color: "#FFFFFF",
    border: "1px solid #000000",
  },
  tabCount: {
    fontSize: 12,
    opacity: 0.85,
    padding: "2px 8px",
    borderRadius: 999,
    border: `1px solid ${COLORS.ink20}`,
  },
  card: {
    width: "100%",
    textAlign: "left",
    borderRadius: 18,
    border: `1px solid ${COLORS.ink20}`,
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
  },
  thumb: {
    borderRadius: 14,
    overflow: "hidden",
    border: `1px solid ${COLORS.ink10}`,
    backgroundColor: "rgba(255,255,255,0.04)",
    flexShrink: 0,
  },
  thumbFallback: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    color: COLORS.ink40,
    fontWeight: 900,
  },
  chev: {
    width: 32,
    height: 32,
    borderRadius: 999,
    border: `1px solid ${COLORS.ink20}`,
    display: "grid",
    placeItems: "center",
    color: COLORS.ink70,
    flexShrink: 0,
  },
  buyLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "12px 16px",
    fontWeight: 900,
    textDecoration: "none",
    backgroundColor: COLORS.red,
    color: COLORS.ink,
    border: `1px solid ${COLORS.red}`,
  },
  zoomBtn: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "zoom-in",
  },
  zoomHint: { marginTop: 8, fontSize: 12, color: COLORS.ink70 },
  modal: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  modalInner: {
    width: "min(980px, 96vw)",
    borderRadius: 18,
    border: `1px solid ${COLORS.ink20}`,
    backgroundColor: "rgba(0,0,0,0.92)",
    padding: 14,
  },
  close: {
    borderRadius: 12,
    border: `1px solid ${COLORS.ink20}`,
    backgroundColor: "transparent",
    color: COLORS.ink,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
  },
};
