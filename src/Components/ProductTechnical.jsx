import React from 'react';
import FinancingWidget from './FinancingWidget';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  gray: '#1A1A1A',
  ink: '#000000',
  ink40: 'rgba(0,0,0,0.40)',
};

function formatEUR(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value).toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function generateMercagarageUrl(productId, productTitle) {
  const numericId = String(productId).match(/\d+/)?.[0] || productId;
  const slug = (productTitle || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `https://mercagarage.com/inicio/${numericId}-${slug}.html`;
}

export default function ProductTechnical({ product, isMobile }) {
  if (!product) return null;
  const tech = product.technical || {};
  const priceText = formatEUR(product.price || product.priceEUR);

  const fastShipping =
    typeof tech.fastShipping !== 'undefined'
      ? tech.fastShipping
      : product.inStock;
  const shippingText = tech.shipping
    ? tech.shipping
    : fastShipping
    ? 'envío 24h'
    : 'envío 7 días hábiles';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        {/* left column reserved for images in parent */}
      </div>

      <div
        style={{
          width: isMobile ? '100%' : 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '2px',
              color: COLORS.gray,
              fontWeight: 800,
            }}
          >
            PRECIO
          </div>
          <div
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 20,
              fontWeight: 800,
              color: COLORS.ink,
              marginTop: 6,
            }}
          >
            {priceText || 'Consultar'}
            {priceText ? (
              <span
                style={{
                  display: 'block',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  color: COLORS.gray,
                  marginTop: 6,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                i. incluidos
              </span>
            ) : null}
          </div>
        </div>

        <a
          href={
            product.buyUrl || generateMercagarageUrl(product.id, product.title)
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 14px',
            background: COLORS.red,
            color: '#fff',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 800,
          }}
        >
          COMPRAR ↗
        </a>

        {/* Widget de financiación */}
        <FinancingWidget 
          productPrice={product.price || product.priceEUR} 
          productTitle={product.title} 
        />

        <div
          style={{
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 14,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Technical details */}
          {tech.reference && tech.reference !== product.reference && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>
                Ref. técnica:
              </span>
              <span style={{ color: COLORS.ink40 }}>{tech.reference}</span>
            </div>
          )}

          {tech.originalReference && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>
                Ref. original:
              </span>
              <span style={{ color: COLORS.ink40 }}>
                {tech.originalReference}
              </span>
            </div>
          )}

          {typeof tech.originalMeasurements !== 'undefined' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>
                Medidas originales:
              </span>
              <span style={{ color: COLORS.ink40 }}>
                {tech.originalMeasurements ? 'Sí' : 'No'}
              </span>
            </div>
          )}

          {tech.measurements && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>
                Medidas (técnicas):
              </span>
              <span style={{ color: COLORS.ink40 }}>{tech.measurements}</span>
            </div>
          )}

          {tech.material && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>Material:</span>
              <span style={{ color: COLORS.ink40 }}>{tech.material}</span>
            </div>
          )}

          {tech.color && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>Color:</span>
              <span style={{ color: COLORS.ink40 }}>{tech.color}</span>
            </div>
          )}

          {Array.isArray(tech.kitContents) && tech.kitContents.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, minWidth: 110 }}>Contenido:</span>
              <div style={{ color: COLORS.ink40 }}>
                {tech.kitContents.map((it, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    {it.qty}× {it.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontWeight: 700, minWidth: 110 }}>Envío:</span>
            <span style={{ color: COLORS.ink40 }}>{shippingText}</span>
          </div>

          {tech.notes && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '1px',
                  color: COLORS.ink40,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Notas:
              </div>
              <div style={{ color: COLORS.ink40 }}>{tech.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
