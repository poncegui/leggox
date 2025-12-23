import "../App.css";

import React, { useEffect, useRef, useState } from "react";

import ActIIIChronos from "../Components/ActIIIChronos";
import ActIIPromoModule from "../Components/ActIIPromoModule";
import Footer from "../Components/Footer/Footer";
import GalleryFormats from "../Components/GalleryFormats";
import HeaderSection from "../Components/HeadingSection/HeaderSection";
import LolaConfiguratorRNFriendly from "../Components/LolaConfiguratorRNFriendly";
import Only7PriceReveal from "../Components/Only7PriceReveal";
import Unum from "../Components/Unum";

// Definir colores de fondo por sección (fuera del componente para evitar recreación)
const SECTION_BACKGROUNDS = {
  0: "#F6EFE6", // Header - cream
  1: "#F6EFE6", // Colors - cream
  2: "#F9EFE4", // Act II - offWhite
  3: "#F6EFE6", // GalleryFormats - cream
  4: "#F6EFE6", // Configurator - cream
  5: "#F6EFE6", // Price - cream
  6: "#333333", // Act III - charcoal (DARK)
  7: "#F6EFE6", // Footer - cream
};

// Función para determinar si un color es oscuro
const isColorDark = (hexColor) => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

function App() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [isConfigCompleted, setIsConfigCompleted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [viewMode, setViewMode] = useState(null); // null, 'horizontal', 'vertical'
  const [showWelcome, setShowWelcome] = useState(true);
  const [stepperColors, setStepperColors] = useState({
    text: "#000",
    active: "#A9D6E5",
    inactive: "rgba(0,0,0,0.3)",
    past: "#000",
  });
  const containerRef = useRef(null);

  const totalSections = 8;

  // Actualizar colores del stepper según la sección actual
  useEffect(() => {
    const bgColor = SECTION_BACKGROUNDS[currentSection] || "#F6EFE6";
    const isDark = isColorDark(bgColor);

    console.log("Section:", currentSection, "BG:", bgColor, "isDark:", isDark); // Debug

    if (isDark) {
      // Fondo oscuro - colores claros
      setStepperColors({
        text: "#F6EFE6",
        active: "#A9D6E5",
        inactive: "rgba(246,239,230,0.4)",
        past: "#F6EFE6",
      });
    } else {
      // Fondo claro - colores oscuros
      setStepperColors({
        text: "#000000",
        active: "#A9D6E5",
        inactive: "rgba(0,0,0,0.3)",
        past: "#000000",
      });
    }
  }, [currentSection]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      const tabletOrMobile = window.innerWidth < 980;
      setIsMobile(mobile);
      setIsTabletOrMobile(tabletOrMobile);
      // En mobile, auto-seleccionar vertical
      if (mobile && viewMode === null) {
        setViewMode("vertical");
        setShowWelcome(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "horizontal" || !containerRef.current) return;

    const handleWheel = (e) => {
      const container = containerRef.current;
      // Si hay movimiento horizontal del touchpad, déjalo pasar naturalmente
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Gesto horizontal dominante - scroll horizontal nativo
        return;
      }
      // Si es movimiento vertical, conviértelo a horizontal
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    const container = containerRef.current;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "horizontal" || !containerRef.current) return;

    const handleScroll = () => {
      const container = containerRef.current;
      const section = Math.round(container.scrollLeft / window.innerWidth);
      setCurrentSection(section);
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

  // Tracking de scroll para vista vertical
  useEffect(() => {
    if (viewMode !== "vertical") return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const section = Math.round(scrollPosition / windowHeight);
      setCurrentSection(Math.min(section, totalSections - 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewMode, totalSections]);

  const scrollToSection = (direction) => {
    if (!containerRef.current) return;
    const nextSection = Math.max(
      0,
      Math.min(totalSections - 1, currentSection + direction),
    );
    containerRef.current.scrollTo({
      left: nextSection * window.innerWidth,
      behavior: "smooth",
    });
  };

  // Pantalla de bienvenida
  if (showWelcome && !isMobile) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F6EFE6",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h1
              style={{
                fontFamily: "APERCU",
                fontSize: "48px",
                fontWeight: 700,
                letterSpacing: "-1.2px",
                margin: 0,
              }}
            >
              Welcome to
              <br />
              Lola Gun Studio
            </h1>
            <div
              style={{
                width: "80px",
                height: "3px",
                backgroundColor: "#A9D6E5",
                margin: "0 auto",
              }}
            />
            <p
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: "14px",
                color: "rgba(0,0,0,0.7)",
                letterSpacing: "0.5px",
                margin: 0,
              }}
            >
              ONLY 7 COLLECTION — EACH ONE UNIQUE
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "24px",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                color: "rgba(0,0,0,0.8)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Choose your viewing experience
            </p>

            <div
              style={{ display: "flex", gap: "16px", justifyContent: "center" }}
            >
              {/* Botón Horizontal */}
              <button
                onClick={() => {
                  setViewMode("horizontal");
                  setShowWelcome(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)";
                }}
                style={{
                  flex: 1,
                  maxWidth: "240px",
                  padding: "24px 32px",
                  backgroundColor: "#000",
                  color: "#F6EFE6",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                  >
                    Horizontal
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    Gallery experience
                  </div>
                </div>
              </button>

              {/* Botón Vertical */}
              <button
                onClick={() => {
                  setViewMode("vertical");
                  setShowWelcome(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)";
                }}
                style={{
                  flex: 1,
                  maxWidth: "240px",
                  padding: "24px 32px",
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid rgba(0,0,0,0.2)",
                  borderRadius: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                  >
                    Vertical
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    Classic scroll
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista vertical
  if (viewMode === "vertical") {
    const sectionNames = [
      "Home",
      "Colors",
      "Design",
      "Formats",
      "Configure",
      "Price",
      "Time",
      "Contact",
    ];

    return (
      <>
        <HeaderSection />
        <Unum colors="colors" typ="fonts" />
        <GalleryFormats />
        <ActIIPromoModule />
        <LolaConfiguratorRNFriendly
          onModelSelect={(model) => setSelectedModel(model)}
          onCompletedChange={(completed) => setIsConfigCompleted(completed)}
        />
        <Only7PriceReveal
          selectedModel={selectedModel}
          isCompleted={isConfigCompleted}
        />
        <ActIIIChronos />
        <Footer />

        {/* Stepper elegante para vertical - solo desktop */}
        {!isTabletOrMobile && (
          <nav
            aria-label="Page navigation"
            role="navigation"
            style={{
              position: "fixed",
              right: "3rem",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              zIndex: 1000,
              transition: "all 0.4s ease",
            }}
          >
            {Array.from({ length: totalSections }).map((_, idx) => {
              const isActive = currentSection === idx;
              const isPast = currentSection > idx;

              return (
                <button
                  key={idx}
                  aria-label={`Go to ${sectionNames[idx]} section`}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => {
                    const sections = document.querySelectorAll(
                      "section, header, footer",
                    );
                    if (sections[idx]) {
                      sections[idx].scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "translateX(0)" : "translateX(8px)",
                      transition: "all 0.4s ease",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      color: stepperColors.text,
                      whiteSpace: "nowrap",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    {sectionNames[idx]}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: isActive ? "20px" : "12px",
                        height: isActive ? "20px" : "12px",
                        borderRadius: "50%",
                        border: `2px solid ${
                          isActive
                            ? stepperColors.active
                            : isPast
                              ? stepperColors.past
                              : stepperColors.inactive
                        }`,
                        backgroundColor: isPast
                          ? stepperColors.past
                          : "transparent",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: isActive
                          ? `0 0 0 4px ${stepperColors.active}33`
                          : "none",
                      }}
                    />
                    {isActive && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: stepperColors.active,
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        )}

        {/* Stepper horizontal bottom para mobile/tablet en modo horizontal */}
        {isTabletOrMobile && viewMode === "horizontal" && (
          <nav
            aria-label="Page navigation"
            role="navigation"
            style={{
              position: "fixed",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              zIndex: 1000,
              transition: "all 0.4s ease",
              padding: "12px 24px",
              backgroundColor: "rgba(246, 239, 230, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "50px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {Array.from({ length: totalSections }).map((_, idx) => {
              const sectionNames = [
                "Home",
                "Colors",
                "Design",
                "Formats",
                "Configure",
                "Price",
                "Time",
                "Contact",
              ];
              const isActive = currentSection === idx;
              const isPast = currentSection > idx;

              return (
                <button
                  key={idx}
                  aria-label={`Go to ${sectionNames[idx]} section`}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    if (containerRef.current) {
                      containerRef.current.scrollTo({
                        left: idx * window.innerWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: isActive ? "16px" : "10px",
                        height: isActive ? "16px" : "10px",
                        borderRadius: "50%",
                        border: `2px solid ${
                          isActive
                            ? stepperColors.active
                            : isPast
                              ? stepperColors.past
                              : stepperColors.inactive
                        }`,
                        backgroundColor: isPast
                          ? stepperColors.past
                          : "transparent",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: isActive
                          ? `0 0 0 4px ${stepperColors.active}33`
                          : "none",
                      }}
                    />
                    {isActive && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: stepperColors.active,
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        )}

        {/* Stepper horizontal para mobile/tablet - bottom */}
        {isTabletOrMobile && (
          <nav
            aria-label="Page navigation"
            role="navigation"
            style={{
              position: "fixed",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              zIndex: 1000,
              transition: "all 0.4s ease",
              padding: "12px 24px",
              backgroundColor: "rgba(246, 239, 230, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: "50px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {Array.from({ length: totalSections }).map((_, idx) => {
              const isActive = currentSection === idx;
              const isPast = currentSection > idx;

              return (
                <button
                  key={idx}
                  aria-label={`Go to ${sectionNames[idx]} section`}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    const sections = document.querySelectorAll(
                      "section, header, footer",
                    );
                    if (sections[idx]) {
                      sections[idx].scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: isActive ? "16px" : "10px",
                        height: isActive ? "16px" : "10px",
                        borderRadius: "50%",
                        border: `2px solid ${
                          isActive
                            ? stepperColors.active
                            : isPast
                              ? stepperColors.past
                              : stepperColors.inactive
                        }`,
                        backgroundColor: isPast
                          ? stepperColors.past
                          : "transparent",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: isActive
                          ? `0 0 0 4px ${stepperColors.active}33`
                          : "none",
                      }}
                    />
                    {isActive && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: stepperColors.active,
                          animation: "pulse 2s infinite",
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(0.9);
            }
          }
        `}</style>
      </>
    );
  }

  // Vista horizontal
  return (
    <>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollSnapStop: "always",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Section 1: Header */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HeaderSection />
        </div>

        {/* Section 2: Colors */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Unum colors="colors" typ="fonts" />
        </div>

        {/* Section 3: Act II */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <ActIIPromoModule />
        </div>

        {/* Section 4: Formats Gallery */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <GalleryFormats />
        </div>

        {/* Section 5: Configurator */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <LolaConfiguratorRNFriendly
            onModelSelect={(model) => setSelectedModel(model)}
            onCompletedChange={(completed) => setIsConfigCompleted(completed)}
          />
        </div>

        {/* Section 6: Price */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Only7PriceReveal
            selectedModel={selectedModel}
            isCompleted={isConfigCompleted}
          />
        </div>

        {/* Section 7: Act III */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <ActIIIChronos />
        </div>

        {/* Section 8: Footer */}
        <div
          style={{
            minWidth: "100vw",
            width: "100vw",
            height: "100vh",
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
            flexShrink: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <Footer />
        </div>
      </div>

      {/* Zonas clickeables laterales invisibles */}
      {currentSection > 0 && (
        <div
          onClick={() => scrollToSection(-1)}
          aria-label="Previous section"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "15%",
            height: "100vh",
            cursor: "w-resize",
            zIndex: 999,
          }}
        />
      )}

      {currentSection < totalSections - 1 && (
        <div
          onClick={() => scrollToSection(1)}
          aria-label="Next section"
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "15%",
            height: "100vh",
            cursor: "e-resize",
            zIndex: 999,
          }}
        />
      )}

      {/* Stepper elegante lateral - solo desktop */}
      {!isTabletOrMobile && (
        <nav
          aria-label="Page navigation"
          role="navigation"
          style={{
            position: "fixed",
            right: "3rem",
            bottom: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            zIndex: 1000,
            transition: "all 0.4s ease",
          }}
        >
          {Array.from({ length: totalSections }).map((_, idx) => {
            const sectionNames = [
              "Home",
              "Colors",
              "Design",
              "Formats",
              "Configure",
              "Price",
              "Time",
              "Contact",
            ];
            const isActive = currentSection === idx;
            const isPast = currentSection > idx;

            return (
              <button
                key={idx}
                aria-label={`Go to ${sectionNames[idx]} section`}
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
                onClick={() => {
                  if (containerRef.current) {
                    containerRef.current.scrollTo({
                      left: idx * window.innerWidth,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                {/* Label (solo visible en hover o activo) */}
                <div
                  aria-hidden="true"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateX(0)" : "translateX(8px)",
                    transition: "all 0.4s ease",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: stepperColors.text,
                    whiteSpace: "nowrap",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  {sectionNames[idx]}
                </div>

                {/* Dot indicator */}
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Outer ring */}
                  <div
                    style={{
                      width: isActive ? "20px" : "12px",
                      height: isActive ? "20px" : "12px",
                      borderRadius: "50%",
                      border: `2px solid ${
                        isActive
                          ? stepperColors.active
                          : isPast
                            ? stepperColors.past
                            : stepperColors.inactive
                      }`,
                      backgroundColor: isPast
                        ? stepperColors.past
                        : "transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isActive
                        ? `0 0 0 4px ${stepperColors.active}33`
                        : "none",
                    }}
                  />
                  {/* Inner dot for active */}
                  {isActive && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: stepperColors.active,
                        animation: "pulse 2s infinite",
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      )}

      {/* Stepper horizontal bottom para mobile/tablet en modo horizontal */}
      {isTabletOrMobile && viewMode === "horizontal" && (
        <nav
          aria-label="Page navigation"
          role="navigation"
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            zIndex: 1000,
            transition: "all 0.4s ease",
            padding: "12px 24px",
            backgroundColor: "rgba(246, 239, 230, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {Array.from({ length: totalSections }).map((_, idx) => {
            const sectionNames = [
              "Home",
              "Colors",
              "Design",
              "Formats",
              "Configure",
              "Price",
              "Time",
              "Contact",
            ];
            const isActive = currentSection === idx;
            const isPast = currentSection > idx;

            return (
              <button
                key={idx}
                aria-label={`Go to ${sectionNames[idx]} section`}
                aria-current={isActive ? "page" : undefined}
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s",
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => {
                  if (containerRef.current) {
                    containerRef.current.scrollTo({
                      left: idx * window.innerWidth,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: isActive ? "16px" : "10px",
                      height: isActive ? "16px" : "10px",
                      borderRadius: "50%",
                      border: `2px solid ${
                        isActive
                          ? stepperColors.active
                          : isPast
                            ? stepperColors.past
                            : stepperColors.inactive
                      }`,
                      backgroundColor: isPast
                        ? stepperColors.past
                        : "transparent",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: isActive
                        ? `0 0 0 4px ${stepperColors.active}33`
                        : "none",
                    }}
                  />
                  {isActive && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: stepperColors.active,
                        animation: "pulse 2s infinite",
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.9);
          }
        }
      `}</style>
    </>
  );
}

export default App;
