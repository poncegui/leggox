import React from "react";

// ✅ ICONOS SVG PROFESIONALES
function IconPhone({ size = 18, color = "currentColor" }) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconSettings({ size = 18, color = "currentColor" }) {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v10M23 12h-6m-10 0H1" />
    </svg>
  );
}

function IconTruck({ size = 18, color = "currentColor" }) {
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

function IconRotate({ size = 18, color = "currentColor" }) {
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
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}

function IconExternalArrow({ size = 18, color = "currentColor" }) {
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
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export default function LeggoxFooter({
  mercaUrl = "https://mercagarage.com/",
  brandName = "Leggox",
}) {
  const year = new Date().getFullYear();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer style={styles.footer} aria-labelledby="footer-title">
      <div style={styles.container}>
        {/* Sección principal */}
        <div style={styles.mainSection}>
          {/* Branding */}
          <div style={styles.brandBlock}>
            <h2 id="footer-title" style={styles.logo}>
              {brandName}
            </h2>
            <p style={styles.tagline}>Recambios para clásicos</p>
            <p style={styles.description}>
              Diseñamos y fabricamos piezas únicas para que el mantenimiento de
              tu coche clásico sea más fiable y sencillo.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div style={styles.linksBlock}>
            <h3 style={styles.linksTitle}>Enlaces</h3>
            <nav style={styles.linksNav} aria-label="Enlaces del pie">
              <a href="/contacto" style={styles.navLink}>
                <IconPhone size={16} color="#666666" />
                <span>Contacto</span>
              </a>
              <a href="/compatibilidad" style={styles.navLink}>
                <IconSettings size={16} color="#666666" />
                <span>Compatibilidad</span>
              </a>
              <a href="/envios" style={styles.navLink}>
                <IconTruck size={16} color="#666666" />
                <span>Envíos</span>
              </a>
              <a href="/devoluciones" style={styles.navLink}>
                <IconRotate size={16} color="#666666" />
                <span>Devoluciones</span>
              </a>
            </nav>
          </div>

          {/* Comprar */}
          <div style={styles.ctaBlock}>
            <h3 style={styles.linksTitle}>Comprar</h3>
            <p style={styles.buyNote}>
              Todos los productos se compran en{" "}
              <strong style={styles.strong}>Mercagarage</strong>
            </p>
            <a
              href={mercaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...styles.ctaButton,
                ...(isMobile && styles.ctaButtonMobile),
              }}
              aria-label="Ir a Mercagarage (se abre en una pestaña nueva)"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(224,30,55,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span>Ir a Mercagarage</span>
              <IconExternalArrow size={18} color="#FFFFFF" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom */}
        <div style={styles.bottomSection}>
          <div style={styles.legalBlock}>
            <p style={styles.legal}>
              © {year} {brandName}. Todos los derechos reservados.
            </p>
            <div style={styles.legalLinks}>
              <a href="/privacidad" style={styles.legalLink}>
                Privacidad
              </a>
              <span style={styles.separator}>·</span>
              <a href="/cookies" style={styles.legalLink}>
                Cookies
              </a>
              <span style={styles.separator}>·</span>
              <a href="/terminos" style={styles.legalLink}>
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: 80,
    padding: "48px 20px 32px",
    background: "#FAFAFA",
    borderTop: "3px solid #E01E37",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%",
  },
  mainSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 40,
    marginBottom: 40,
  },
  brandBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  logo: {
    fontSize: 32,
    fontWeight: 900,
    margin: 0,
    color: "#000000",
    fontFamily: "APERCU, sans-serif",
    letterSpacing: "-0.02em",
  },
  tagline: {
    fontSize: 14,
    margin: 0,
    color: "#E01E37",
    fontFamily: "ui-monospace, monospace",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
    color: "#666666",
    maxWidth: 360,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
  },
  linksBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  linksTitle: {
    fontSize: 14,
    fontWeight: 800,
    margin: 0,
    color: "#000000",
    fontFamily: "APERCU, sans-serif",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  linksNav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "#666666",
    textDecoration: "none",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  ctaBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  buyNote: {
    fontSize: 13,
    margin: 0,
    color: "#666666",
    lineHeight: 1.5,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
  },
  strong: {
    color: "#000000",
    fontWeight: 700,
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 20px",
    borderRadius: 12,
    border: "2px solid #E01E37",
    background: "#E01E37",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 800,
    fontFamily: "APERCU, sans-serif",
    transition: "all 0.3s ease",
    cursor: "pointer",
    maxWidth: 240,
  },
  ctaButtonMobile: {
    width: "100%",
    maxWidth: "100%",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    background: "#E0E0E0",
    marginBottom: 24,
  },
  bottomSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  legalBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  legal: {
    fontSize: 13,
    margin: 0,
    color: "#999999",
    fontFamily: "ui-monospace, monospace",
  },
  legalLinks: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  legalLink: {
    fontSize: 12,
    color: "#999999",
    textDecoration: "none",
    fontFamily: "ui-monospace, monospace",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  separator: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  madeWith: {
    fontSize: 13,
    margin: 0,
    color: "#999999",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
  },
};
