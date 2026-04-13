import React, { useState } from 'react';

/**
 * Componente para mostrar/ocultar el widget de Aplazame
 * Utiliza un botón collapsable para mejor UX
 */
export default function FinancingWidget({ productPrice, productTitle }) {
  const [showWidget, setShowWidget] = useState(false);

  if (!productPrice) return null;

  return (
    <div style={{ marginTop: 20 }}>
      {/* Botón para mostrar/ocultar */}
      <button
        onClick={() => setShowWidget(!showWidget)}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: 12,
          border: '2px solid #334BFF',
          backgroundColor: showWidget ? 'rgba(51, 75, 255, 0.1)' : '#FFFFFF',
          color: '#334BFF',
          fontFamily: 'APERCU, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(51, 75, 255, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(51, 75, 255, 0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = showWidget
            ? 'rgba(51, 75, 255, 0.1)'
            : '#FFFFFF';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'transform 0.3s ease',
              transform: showWidget ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Calcula tu financiación
        </span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {showWidget ? 'Ocultar' : 'Ver'}
        </span>
      </button>

      {/* Contenedor del widget (collapsable) */}
      {showWidget && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            backgroundColor: '#FAFAFA',
            animation: 'slideDown 0.3s ease',
          }}
        >
          {/* Mensaje de carga del widget */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: '#666666',
              fontFamily: 'APERCU, sans-serif',
              fontSize: 14,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#334BFF',
                animation: 'pulse 1.5s infinite',
              }}
            />
            Cargando opciones de financiación...
          </div>

          {/* Contenedor para el widget de Aplazame */}
          <div
            id="aplazame-widget-container"
            style={{
              marginTop: 12,
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* El widget HTML de Aplazame se renderizará aquí */}
            {/* El HTML debe venir del servidor o inyectarse dinámicamente */}
          </div>

          {/* Nota legal */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #E5E7EB',
              fontSize: 11,
              color: '#999999',
              fontFamily: 'ui-monospace, monospace',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            Financiación ofrecida por APLAZAME (Wizink Bank S.A.U). Sujeto a
            aprobación.
            <br />
            Consulta las condiciones en aplazame.com
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
