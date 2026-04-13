import React, { useState } from "react";

// Icono SVG elegante de lupa
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

export default function ZoomImage({ src, alt, isMobile }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          textAlign: "left",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "zoom-in",
          position: "relative",
        }}
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
            border: "1px solid rgba(255,255,255,0.1)",
            display: "block",
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
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 9999,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: "min(980px, 96vw)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(0,0,0,0.92)",
              padding: 14,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              style={{
                width: "100%",
                maxHeight: isMobile ? 320 : 480,
                objectFit: "contain",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar visor"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "transparent",
                color: "#FFF",
                border: "none",
                fontSize: 28,
                fontWeight: 900,
                cursor: "pointer",
                padding: 4,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
