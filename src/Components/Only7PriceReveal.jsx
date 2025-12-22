import React from "react";

/**
 * Gallery Price Component
 * - Sobrio, estilo galería/catálogo
 * - Punto rojo para modelo seleccionado
 * - Sin animaciones llamativas
 * - 100% portable a React Native
 */

const COLORS = {
  ink: "#000000",
  ink70: "rgba(0,0,0,0.70)",
  ink30: "rgba(0,0,0,0.30)",
  red: "#C23B3B", // punto rojo galería
};

export default function GalleryPrice({
  selectedModel, // "ORIGO" | "FORMA" | "MOTUS" | "ESSENTIA" | null
  isCompleted = false, // Only show when configuration is completed
  priceMap = {
    ORIGO: "€1,200",
    FORMA: "€1,450",
    MOTUS: "€1,650",
    ESSENTIA: "€1,900",
  },
}) {
  if (!selectedModel || !isCompleted) return null;

  return (
    <div
      role="region"
      aria-label="Artwork price"
      style={{
        backgroundColor: "#F6EFE6",
        padding: "10px 20px 40px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.ink30}`,
          maxWidth: 420,
          width: "100%",
        }}
      >
        {/* Model line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Red dot */}
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: COLORS.red,
            }}
          />

          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.6,
            }}
          >
            {selectedModel}
          </span>
        </div>

        {/* Price */}
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: COLORS.ink70,
          }}
        >
          {priceMap[selectedModel]}
        </div>

        {/* Subtle note */}
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: COLORS.ink30,
            fontStyle: "italic",
          }}
        >
          Only 7 pieces per model
        </div>
      </div>
    </div>
  );
}
