import React, { useEffect, useMemo, useState } from "react";

/**
 * ACT II Promo Module (RN-friendly Web)
 * - Responsive (column mobile / row desktop)
 * - Accessible (region landmark + headings + focus states)
 * - Styles in JS objects (easy to migrate to React Native StyleSheet)
 */

const COLORS = {
  cream: "#F6EFE6",
  charcoal: "#333",
  offWhite: "#F9EFE4",
  ink: "#000000",
  ink70: "rgba(0,0,0,0.70)",
  ink40: "rgba(0,0,0,0.40)",
  ink20: "rgba(0,0,0,0.20)",
  line: "#A9D6E5",
  card: "rgba(255,255,255,0.35)",
};

// RN-like primitives
function Box({ as: Tag = "div", style, children, ...rest }) {
  return (
    <Tag style={style} {...rest}>
      {children}
    </Tag>
  );
}
function Row({ style, children, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "row", ...style }} {...rest}>
      {children}
    </div>
  );
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

export default function ActIIPromoModule({
  titleTop = "/. Choose to be one of us",
  actLabel = "ACT II.",
  // Contenido del panel izquierdo (sustituto de COLORS)
  leftSections = [
    {
      label: "BASIS",
      value: "Mold / Base",
      note: "Rect · Square · Round · Capsule",
    },
    {
      label: "MATERIA",
      value: "Your own · Studio curated",
      note: "Send yours or pick 1 of 3 designs",
    },
    {
      label: "SUPPORTUS",
      value: "Metal · Acrylic · Wood",
      note: "Black · Chrome · Clear · Oak",
    },
    {
      label: "MENSURAE",
      value: "From 60 to 140 cm",
      note: "Custom measures available",
    },
  ],
  // CTA opcional (web). En RN lo migras a Pressable fácilmente.
  onPressCTA,
  ctaLabel = "Open configurator",
}) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmall = windowWidth < 480;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 980;

  const layoutStyle = useMemo(
    () => ({
      display: "flex",
      flexDirection: isMobile ? "column" : "row-reverse",
      borderRadius: 0,
      overflow: "hidden",
      border: "none",
      width: "100%",
      height: isMobile ? "auto" : "100vh",
      margin: 0,
      justifyContent: "center",
      gap: isSmall ? "1.5rem" : isMobile ? "2rem" : isTablet ? "3rem" : "7rem",
      padding: isMobile ? "3rem 1rem" : 0,
    }),
    [isSmall, isMobile, isTablet],
  );

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="act2-heading"
      style={{
        backgroundColor: COLORS.charcoal,
        padding: 0,
        margin: 0,
        width: "100%",
      }}
    >
      {/* Hidden accessible heading for the region */}
      <Text
        as="h2"
        id="act2-heading"
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Act II promotional module
      </Text>

      <div style={layoutStyle}>
        {/* RIGHT PANEL - Title */}
        <div
          style={{
            width: isMobile ? "100%" : isTablet ? "65%" : "70%",
            backgroundColor: COLORS.charcoal,
            padding: isMobile
              ? "2rem 1.5rem"
              : isTablet
                ? "2.5rem 3rem"
                : "3% 5%",
            display: "flex",
            alignItems: "center",
            textAlign: isMobile ? "center" : "right",
          }}
        >
          <Col style={{ width: "100%", gap: 18 }}>
            <Text
              as="h2"
              style={{
                color: COLORS.offWhite,
                fontSize: isSmall ? 36 : isMobile ? 42 : isTablet ? 60 : 80,
                fontWeight: 700,
                fontFamily: "APERCU",
                lineHeight: 1.02,
              }}
            >
              {titleTop}
            </Text>
          </Col>
        </div>

        {/* LEFT PANEL - Specs */}
        <div
          style={{
            width: isMobile ? "100%" : isTablet ? "35%" : "30%",
            maxWidth: isMobile ? "400px" : "none",
            margin: isMobile ? "0 auto" : 0,
            backgroundColor: COLORS.offWhite,
            padding: isSmall ? 18 : isMobile ? 20 : isTablet ? 22 : 24,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col style={{ gap: isSmall ? 14 : 18 }}>
            <Text
              as="h3"
              style={{
                fontSize: isSmall ? 16 : 18,
                fontWeight: 700,
                letterSpacing: -0.3,
                fontFamily: "APERCU",
              }}
            >
              Specs
            </Text>

            <div style={{ height: 1, backgroundColor: COLORS.ink20 }} />

            {/* Sections */}
            <Col as="div" style={{ gap: isSmall ? 12 : 16 }}>
              {leftSections.map((s) => (
                <div key={s.label}>
                  <Text
                    as="div"
                    style={{
                      fontSize: isSmall ? 12 : 14,
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </Text>
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: isSmall ? 14 : 16,
                      fontWeight: 500,
                    }}
                  >
                    {s.value}
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: isSmall ? 12 : 13,
                      color: COLORS.ink70,
                    }}
                  >
                    {s.note}
                  </Text>
                </div>
              ))}
            </Col>

            {/* ACT II badge - estilo simple como Unum */}
            <div
              style={{
                fontFamily: "APERCU, sans-serif",
                marginTop: "1rem",
              }}
              aria-hidden="true"
            >
              {actLabel}
            </div>
          </Col>
        </div>
      </div>
    </Box>
  );
}
