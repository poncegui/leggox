import React from "react";

/**
 * ScrollStepper - Indicador de navegación vertical con carretera y coche
 * Muestra el progreso de scroll a través de las secciones de la página
 */

function ScrollStepper({ currentSection, totalSections, sectionNames }) {
  const [showLabel, setShowLabel] = React.useState(true);

  React.useEffect(() => {
    // Mostrar la etiqueta cuando cambia la sección
    setShowLabel(true);

    // Ocultar después de 2 segundos
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentSection]);

  return (
    <div
      aria-label="Indicador de progreso"
      role="progressbar"
      aria-valuenow={currentSection}
      aria-valuemin={0}
      aria-valuemax={totalSections - 1}
      style={{
        position: "fixed",
        right: "3rem",
        top: "10%",
        bottom: "10%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      {/* Línea de carretera */}
      <div
        style={{
          position: "relative",
          width: "4px",
          height: "100%",
          background:
            "linear-gradient(to bottom, #333 0%, #333 40%, transparent 40%, transparent 60%, #333 60%, #333 100%)",
          backgroundSize: "100% 40px",
          backgroundRepeat: "repeat-y",
          borderRadius: "2px",
        }}
      >
        {/* Coche que se mueve */}
        <div
          style={{
            position: "absolute",
            top: `${(currentSection / (totalSections - 1)) * 100}%`,
            left: "50%",
            transform: "translate(-50%, -50%)",
            transition: "top 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "32px",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        >
          🏎️
        </div>

        {/* Marcadores de sección clickeables */}
        {Array.from({ length: totalSections }).map((_, idx) => {
          const isActive = currentSection === idx;
          const isPast = currentSection > idx;

          return (
            <button
              key={idx}
              aria-label={`Ir a ${sectionNames[idx]}`}
              onClick={() => {
                const sections = document.querySelectorAll(
                  "section, header, footer",
                );
                if (sections[idx]) {
                  sections[idx].scrollIntoView({ behavior: "smooth" });
                }
              }}
              style={{
                position: "absolute",
                top: `${(idx / (totalSections - 1)) * 100}%`,
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: `2px solid ${
                  isActive ? "#E01E37" : isPast ? "#666" : "#444"
                }`,
                backgroundColor: isPast ? "#666" : "transparent",
                cursor: "pointer",
                transition: "all 0.3s ease",
                zIndex: isActive ? 10 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translate(-50%, -50%) scale(1.3)";
                e.currentTarget.style.borderColor = "#E01E37";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translate(-50%, -50%) scale(1)";
                e.currentTarget.style.borderColor = isActive
                  ? "#E01E37"
                  : isPast
                    ? "#666"
                    : "#444";
              }}
            />
          );
        })}

        {/* Bandera de meta al final */}
        <div
          style={{
            position: "absolute",
            bottom: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "24px",
          }}
        >
          🏁
        </div>
      </div>

      {/* Etiqueta de sección actual */}
      <div
        style={{
          position: "absolute",
          top: `${(currentSection / (totalSections - 1)) * 100}%`,
          right: "50px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.85)",
          color: "#E01E37",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 600,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          fontFamily: "APERCU, sans-serif",
          letterSpacing: "0.5px",
          boxShadow: "0 4px 12px rgba(224,30,55,0.3)",
          transition:
            "top 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
          opacity: showLabel ? 1 : 0,
        }}
      >
        {sectionNames[currentSection]}
      </div>
    </div>
  );
}

export default ScrollStepper;
