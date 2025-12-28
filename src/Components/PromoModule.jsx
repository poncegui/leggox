import React, { useEffect, useMemo, useState } from "react";

// ✅ Iconos SVG
function IconFlash({ size = 14, color = "currentColor" }) {
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
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function IconWhatsApp({ size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconExternalLink({ size = 16, color = "currentColor" }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IconZoomIn({ size = 20, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
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

/**
 * LEGGOX — PROMO MODULE (OFERTAS REALES)
 * - Usa el JSON de productos (manguitos + radiadores) y destaca SOLO los que estén en oferta.
 * - Cards con: badge OFERTA, precio antes tachado, precio ahora, ahorro €, stock, CTA a Mercagarage (_blank).
 * - Mantiene estética LEGGOX (negro/blanco/rojo) y es responsive + a11y.
 *
 * ✅ Cómo usar:
 * <PromoModule products={PRODUCTS_JSON} />
 *
 * ✅ Requisito del JSON (mínimo):
 * {
 *   id, title, type: 'manguito'|'radiador',
 *   vehicles: ['SEAT 127', ...] (opcional),
 *   price: 179,
 *   oldPrice: 199 (si está en oferta),
 *   onSale: true (o lo deduce si oldPrice > price),
 *   inStock: true|false,
 *   buyUrl: "https://mercagarage.com/recambios/....html",
 *   images: { sketch?: '...', real?: '...' }
 * }
 */

const COLORS = {
  black: "#000000",
  darkGray: "#1A1A1A",
  white: "#FFFFFF",
  red: "#E01E37",
  darkRed: "#DC143C",
  ink70: "rgba(255,255,255,0.70)",
  ink40: "rgba(255,255,255,0.40)",
  ink20: "rgba(255,255,255,0.20)",
  panel: "rgba(224,30,55,0.10)",
  card: "rgba(255,255,255,0.06)",
};

function formatEUR(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount)))
    return "—";
  return Number(amount).toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Col({ style, children, ...rest }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
function Row({ style, children, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", ...style }} {...rest}>
      {children}
    </div>
  );
}
function Text({ as: Tag = "div", style, children, ...rest }) {
  return (
    <Tag
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
function Mono({ as: Tag = "div", style, children, ...rest }) {
  return (
    <Tag
      style={{
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function SaleBadge({ children = "¡OFERTA!" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        backgroundColor: COLORS.red,
        color: COLORS.white,
        fontWeight: 900,
        letterSpacing: "1px",
        fontSize: 11,
        textTransform: "uppercase",
        boxShadow: "0 10px 30px rgba(224,30,55,0.35)",
      }}
    >
      <IconFlash size={14} color="#FFFFFF" />
      {children}
    </span>
  );
}

function StockPill({ inStock }) {
  const label = inStock ? "Disponible" : "No disponible";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${COLORS.ink20}`,
        color: inStock ? "rgba(255,255,255,0.85)" : COLORS.ink70,
        backgroundColor: "rgba(0,0,0,0.25)",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          backgroundColor: inStock ? "#2ECC71" : COLORS.red,
        }}
      />
      {label}
    </span>
  );
}

function PromoCard({ item, isMobile }) {
  const {
    title,
    type,
    price,
    oldPrice,
    onSale,
    inStock,
    buyUrl,
    images,
    vehicles,
  } = item;

  const cover = images?.sketch || images?.real;
  const inferredOnSale = Boolean(
    onSale || (oldPrice && price && oldPrice > price),
  );
  const safeOld = inferredOnSale ? oldPrice : null;

  const savings =
    inferredOnSale && safeOld && price
      ? Math.max(0, Number(safeOld) - Number(price))
      : 0;

  const savingsPct =
    inferredOnSale && safeOld && price
      ? clamp(
          Math.round(
            ((Number(safeOld) - Number(price)) / Number(safeOld)) * 100,
          ),
          1,
          95,
        )
      : 0;

  return (
    <article
      style={{
        borderRadius: 18,
        border: `1px solid ${COLORS.ink20}`,
        background: COLORS.white,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ padding: isMobile ? 14 : 16 }}>
        <Row
          style={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <Col style={{ gap: 8, minWidth: 0 }}>
            <Mono
              style={{
                color: COLORS.darkGray,
                fontSize: 11,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              {type?.toUpperCase() || "PRODUCTO"}
            </Mono>

            <Text
              as="h3"
              style={{
                margin: 0,
                color: COLORS.black,
                fontWeight: 900,
                letterSpacing: -0.4,
                lineHeight: 1.15,
                fontSize: isMobile ? 16 : 18,
              }}
            >
              {title}
            </Text>

            {Array.isArray(vehicles) && vehicles.length > 0 && (
              <Text
                style={{
                  color: COLORS.darkGray,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: isMobile ? "75vw" : "520px",
                }}
                title={vehicles.join(" · ")}
              >
                Compatibilidad: {vehicles.join(" · ")}
              </Text>
            )}
          </Col>

          {inferredOnSale ? <SaleBadge /> : null}
        </Row>

        {/* Image + Price */}
        <Row
          style={{
            marginTop: 14,
            gap: 14,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              border: `1px solid ${COLORS.darkGray}`,
              backgroundColor: "#F5F5F5",
              overflow: "hidden",
              width: isMobile ? "100%" : 220,
              aspectRatio: isMobile ? "16/9" : "4/3",
              display: "grid",
              placeItems: "center",
              cursor: cover ? "pointer" : "default",
              transition: "all 0.3s ease",
            }}
            aria-label={cover ? `Imagen de ${title}` : "Sin imagen"}
            onClick={() => cover && window.open(cover, "_blank")}
            onMouseEnter={(e) => {
              if (cover) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (cover) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {cover ? (
              <>
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
                {/* Icono de lupa */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    backgroundColor: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 8,
                    padding: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(224,30,55,0.9)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.75)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <IconZoomIn size={16} color="#FFFFFF" />
                </div>
              </>
            ) : (
              <Mono style={{ color: COLORS.darkGray, fontSize: 12 }}>
                Sin imagen
              </Mono>
            )}
          </div>

          {/* Price block */}
          <Col style={{ flex: 1, gap: 10 }}>
            <Row
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <StockPill inStock={Boolean(inStock)} />
              {inferredOnSale ? (
                <Mono
                  style={{
                    color: "rgba(224,30,55,0.9)",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Ahorro {formatEUR(savings)} · {savingsPct}% OFF
                </Mono>
              ) : null}
            </Row>

            <Row style={{ alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              {inferredOnSale && safeOld ? (
                <Text
                  style={{
                    color: "#999999",
                    fontWeight: 800,
                    textDecoration: "line-through",
                    textDecorationThickness: 2,
                    fontSize: isMobile ? 14 : 15,
                  }}
                >
                  {formatEUR(safeOld)}
                </Text>
              ) : null}

              <Text
                style={{
                  color: COLORS.black,
                  fontWeight: 900,
                  letterSpacing: -0.8,
                  fontSize: isMobile ? 26 : 30,
                }}
              >
                {formatEUR(price)}
              </Text>
            </Row>

            {inStock ? (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Comprar ${title} en Mercagarage (se abre en una pestaña nueva)`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: "#1E90FF",
                  color: COLORS.white,
                  textDecoration: "none",
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  fontSize: 13,
                  border: "1px solid #1E90FF",
                  cursor: "pointer",
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                Comprar en Mercagarage{" "}
                <IconExternalLink size={16} color="#FFFFFF" />
              </a>
            ) : (
              <a
                href="https://api.whatsapp.com/send?l=es&phone=624605343&text=Bienvenid@%20a%20nuestra%20web!,%20cu%C3%A9ntenos%20qu%C3%A9%20necesita...."
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Solicitar información sobre ${title} por WhatsApp`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 12,
                  backgroundColor: "#FFA500",
                  color: COLORS.white,
                  textDecoration: "none",
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  fontSize: 13,
                  border: "1px solid #FFA500",
                  cursor: "pointer",
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                Solicitar información <IconWhatsApp size={16} color="#FFFFFF" />
              </a>
            )}

            <Mono
              style={{ color: COLORS.darkGray, fontSize: 12, lineHeight: 1.5 }}
            >
              Oferta limitada. Piezas premium para clásicos Leggox.
            </Mono>
          </Col>
        </Row>
      </div>
    </article>
  );
}

/**
 * Si no pasas products, puedes pegar aquí tu JSON.
 * IMPORTANTE: marca los 2 items en oferta con `onSale: true` y `oldPrice`.
 */
const FALLBACK_PRODUCTS = [
  // EJEMPLO 1 (OFERTA)
  {
    id: "radiador-127-fura-cl1010-doble-nucleo",
    type: "radiador",
    title: "Radiador Aluminio SEAT 127 / FURA / (CL 1010) DOBLE NÚCLEO",
    vehicles: ["SEAT 127", "SEAT Fura"],
    price: 159,
    oldPrice: 179,
    onSale: true,
    inStock: false,
    buyUrl:
      "https://mercagarage.com/recambios/60857-radiador-seat-131-1600cc-doble-n%C3%BAcleo-en-aluminio.html",
    images: {
      sketch: require("../Assets/images/radiadores/radiador-aluminio-seat-127-fura-cl-1010.jpg"),
    },
  },
  // EJEMPLO 2 (OFERTA)
  {
    id: "radiador-127-fura-oem-aluminio",
    type: "radiador",
    title: 'Radiador Aluminio SEAT 127 / FURA "ALUMINIO" OEM',
    vehicles: ["SEAT 127", "SEAT Fura"],
    price: 179,
    oldPrice: 199,
    onSale: true,
    inStock: true,
    buyUrl:
      "https://mercagarage.com/recambios/60857-radiador-seat-131-1600cc-doble-n%C3%BAcleo-en-aluminio.html",
    images: {
      sketch: require("../Assets/images/radiadores/radiador-aluminio-seat-127-fura-cl-1010-02.jpg"),
    },
  },
];

export default function PromoModule({
  products,
  titleTop = "OFERTAS LEGGOX",
  subtitle = "Solo por tiempo limitado · Radiadores y manguitos con descuento",
  ctaLabel = "Ver todas las piezas",
  ctaHref = "https://mercagarage.com/",
  maxItems = 6,
}) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 480;

  const all =
    Array.isArray(products) && products.length ? products : FALLBACK_PRODUCTS;

  // Solo ofertas: onSale===true O oldPrice>price
  const saleItems = useMemo(() => {
    return all
      .filter((p) => {
        const onSale = Boolean(
          p.onSale || (p.oldPrice && p.price && p.oldPrice > p.price),
        );
        return onSale;
      })
      .sort((a, b) => {
        // mayor ahorro primero
        const sa = (a.oldPrice || 0) - (a.price || 0);
        const sb = (b.oldPrice || 0) - (b.price || 0);
        return sb - sa;
      })
      .slice(0, maxItems);
  }, [all, maxItems]);

  return (
    <section
      aria-label="Promoción Leggox: productos en oferta"
      style={{
        backgroundColor: COLORS.black,
        color: COLORS.white,
        width: "100%",
        padding: isMobile ? "3rem 1rem" : "4.5rem 6%",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Header */}
        <Row
          style={{
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 18,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Col style={{ gap: 10 }}>
            <Mono
              style={{
                color: "rgba(224,30,55,0.95)",
                fontWeight: 900,
                letterSpacing: 2,
                fontSize: 12,
                textTransform: "uppercase",
              }}
            >
              {titleTop}
            </Mono>

            <Text
              as="h2"
              style={{
                margin: 0,
                fontFamily: "APERCU, sans-serif",
                fontWeight: 400,
                letterSpacing: isSmall ? -0.6 : -1.2,
                lineHeight: 1.05,
                fontSize: isSmall ? 34 : isMobile ? 40 : 56,
              }}
            >
              Productos en oferta
            </Text>

            <Text style={{ color: COLORS.ink70, fontSize: isMobile ? 14 : 16 }}>
              {subtitle}
            </Text>

            <div
              style={{
                height: 3,
                width: 320,
                maxWidth: "70vw",
                backgroundColor: COLORS.red,
              }}
            />
          </Col>

          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 16px",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: COLORS.red,
              textDecoration: "none",
              fontWeight: 900,
              fontFamily:
                'ui-monospace, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              border: `1px solid ${COLORS.red}`,
              whiteSpace: "nowrap",
            }}
            aria-label={`${ctaLabel} (se abre en una pestaña nueva)`}
          >
            {ctaLabel} <span aria-hidden="true">↗</span>
          </a>
        </Row>

        {/* Body */}
        <div style={{ marginTop: 24 }}>
          {saleItems.length === 0 ? (
            <div
              style={{
                borderRadius: 18,
                border: `1px solid ${COLORS.ink20}`,
                backgroundColor: COLORS.panel,
                padding: 18,
              }}
            >
              <Text style={{ fontWeight: 900, fontSize: 16 }}>
                Ahora mismo no hay ofertas marcadas.
              </Text>
              <Text style={{ color: COLORS.ink70, marginTop: 6, fontSize: 13 }}>
                Marca los productos con <Mono as="span">onSale: true</Mono> y
                añade <Mono as="span">oldPrice</Mono> para que aparezcan aquí.
              </Text>
            </div>
          ) : (
            <div
              role="list"
              aria-label="Lista de productos en oferta"
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              {saleItems.map((item) => (
                <div role="listitem" key={item.id}>
                  <PromoCard item={item} isMobile={isMobile} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <Row
          style={{
            marginTop: 16,
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Mono style={{ fontSize: 12, color: COLORS.ink40 }}>
            {saleItems.length} oferta{saleItems.length === 1 ? "" : "s"}{" "}
            destacada
            {saleItems.length === 1 ? "" : "s"}
          </Mono>
        </Row>
      </div>
    </section>
  );
}
