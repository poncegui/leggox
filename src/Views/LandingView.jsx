import "../App.css";

import React, { useEffect, useState } from "react";

import PromoModule from "../Components/PromoModule";
import Footer from "../Components/Footer/Footer";
import HeaderSection from "../Components/HeadingSection/HeaderSection";
import BuscadorPiezas from "../Components/BuscadorPiezas";
import ProductShowcase from "../Components/ProductShowcase";
import ScrollStepper from "../Components/ScrollStepper";
import mercagarageLogo from "../Assets/images/mercagarage-logo.jpg";
import PitlaneRunner from "../Components/PitlaneRunner";

// ✅ Iconos SVG para Mercagarage
function IconTruckFast({ size = 32, color = "currentColor" }) {
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
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconCheck({ size = 32, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconMessageCircle({ size = 32, color = "currentColor" }) {
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

// Definir colores de fondo por sección
const SECTION_BACKGROUNDS = {
  0: "#000000", // Header - Negro
  1: "#FFFFFF", // Modelos - Blanco
  2: "#1A1A1A", // Catálogo - Gris oscuro
  3: "#FFFFFF", // Galería - Blanco
  4: "#000000", // Configurador - Negro
  5: "#FFFFFF", // Presupuesto - Blanco
  6: "#1A1A1A", // Manguitos - Gris oscuro
  7: "#000000", // Información - Negro
  8: "#1A1A1A", // Footer/Contacto - Gris oscuro
};

function App() {
  const [setIsConfigCompleted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const totalSections = 6;

  // Detectar mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tracking de scroll para vista vertical
  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
        document.documentElement.style.scrollSnapType = "y proximity";
      }
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const section = Math.round(scrollPosition / windowHeight);
      setCurrentSection(Math.min(section, totalSections - 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalSections, hasScrolled]);

  const sectionNames = [
    "Inicio",
    "Ofertas",
    "Manguitos y radiadores",
    "Búsqueda por vehículo",
    "Leggox Race",
    "Contacto",
  ];

  return (
    <>
      {/* Secciones */}
      <div
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          backgroundColor: SECTION_BACKGROUNDS[0],
        }}
      >
        <HeaderSection />
      </div>

      <section
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          backgroundColor: SECTION_BACKGROUNDS[2],
        }}
      >
        <PromoModule />
      </section>

      <section
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          backgroundColor: SECTION_BACKGROUNDS[1],
        }}
      >
        <ProductShowcase />
      </section>

      <section
        style={{
          minHeight: "100vh",
          scrollSnapAlign: "start",
          backgroundColor: SECTION_BACKGROUNDS[4],
        }}
      >
        <BuscadorPiezas onComplete={() => setIsConfigCompleted(true)} />
      </section>

      {/* Footer */}
      <div style={{ background: "#1A1A1A", padding: "40px 0" }}>
        <PitlaneRunner />
      </div>
      <Footer />

      {/* Sección Mercagarage */}
      <section
        style={{
          backgroundColor: "#000000",
          padding: "60px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bandera de competición de fondo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.02) 35px,
              rgba(255,255,255,0.02) 70px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.02) 35px,
              rgba(255,255,255,0.02) 70px
            )
          `,
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Logo y título */}
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <img
              src={mercagarageLogo}
              alt="Mercagarage - Accesorios & Recambios Automoción"
              style={{
                maxWidth: 450,
                width: "100%",
                height: "auto",
                marginBottom: 16,
              }}
            />
            <p
              style={{
                fontSize: 16,
                margin: 0,
                color: "rgba(255,255,255,0.7)",
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
              }}
            >
              Tu tienda de recambios para coches clásicos
            </p>
          </div>

          {/* Features grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
              width: "100%",
            }}
          >
            <div style={mercaStyles.featureCard}>
              <div style={mercaStyles.featureIcon}>
                <IconTruckFast size={28} color="#E01E37" />
              </div>
              <h3 style={mercaStyles.featureTitle}>Envío rápido</h3>
              <p style={mercaStyles.featureText}>
                Recibe tus piezas en 24-48h en toda la península
              </p>
            </div>

            <div style={mercaStyles.featureCard}>
              <div style={mercaStyles.featureIcon}>
                <IconCheck size={28} color="#E01E37" />
              </div>
              <h3 style={mercaStyles.featureTitle}>Calidad garantizada</h3>
              <p style={mercaStyles.featureText}>
                Productos testados y certificados para tu clásico
              </p>
            </div>

            <div style={mercaStyles.featureCard}>
              <div style={mercaStyles.featureIcon}>
                <IconMessageCircle size={28} color="#E01E37" />
              </div>
              <h3 style={mercaStyles.featureTitle}>Asesoramiento</h3>
              <p style={mercaStyles.featureText}>
                Expertos en coches clásicos te ayudan a elegir
              </p>
            </div>
          </div>

          {/* CTA */}
          <a
            href="https://mercagarage.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={mercaStyles.ctaButton}
          >
            <span>Visitar Mercagarage</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* Indicador de carretera con coche - Solo desktop */}
      {!isMobile && (
        <ScrollStepper
          currentSection={currentSection}
          totalSections={totalSections}
          sectionNames={sectionNames}
        />
      )}
    </>
  );
}

export default App;

const mercaStyles = {
  featureCard: {
    padding: 24,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    transition: "all 0.3s ease",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 800,
    margin: 0,
    color: "#FFFFFF",
    fontFamily: "APERCU, sans-serif",
  },
  featureText: {
    fontSize: 13,
    margin: 0,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.5,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "16px 32px",
    borderRadius: 12,
    border: "2px solid #E01E37",
    background: "#E01E37",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 800,
    fontFamily: "APERCU, sans-serif",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
};
