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

function useIsWide(breakpoint = 980) {
  const [wide, setWide] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth >= breakpoint,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWide(window.innerWidth >= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return wide;
}

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
  titleTop = "/. Design yours or choose one of us",
  titleBottom = "or chose one of us.",
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
  const isWide = useIsWide(980);

  const layoutStyle = useMemo(
    () => ({
      display: "flex",
      flexDirection: isWide ? "row-reverse" : "column",
      borderRadius: 0,
      overflow: "hidden",
      border: "none",
      width: "100%",
      height: "100vh",
      margin: 0,
      justifyContent: "center",
      gap: isWide ? "7rem" : "2rem",
    }),
    [isWide],
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
            width: isWide ? "70%" : "100%",
            backgroundColor: COLORS.charcoal,
            padding: isWide ? "3% 5%" : "2% 3%",
            display: "flex",
            alignItems: "center",
            textAlign: "right",
          }}
        >
          <Col style={{ width: "100%", gap: 18 }}>
            <Text
              as="h2"
              style={{
                color: COLORS.offWhite,
                fontSize: isWide ? 80 : 40,
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
            width: isWide ? "30%" : "90%",
            backgroundColor: COLORS.offWhite,
            padding: isWide ? 24 : 18,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col style={{ gap: 18 }}>
            <Text
              as="h3"
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: -0.3,
                fontFamily: "APERCU",
              }}
            >
              Specs
            </Text>

            <div style={{ height: 1, backgroundColor: COLORS.ink20 }} />

            {/* Sections */}
            <Col as="div" style={{ gap: 16 }}>
              {leftSections.map((s) => (
                <div key={s.label}>
                  <Text
                    as="div"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 16, fontWeight: 500 }}>
                    {s.value}
                  </Text>
                  <Text
                    style={{ marginTop: 4, fontSize: 13, color: COLORS.ink70 }}
                  >
                    {s.note}
                  </Text>
                </div>
              ))}
            </Col>

            {/* ACT II badge dentro del panel blanco */}
            <div
              style={{
                position: "relative",
                left: "15rem",
                width: 200,
                height: 100,
                backgroundColor: "#add8e6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                textAlign: "center",
                lineHeight: "100px",
              }}
              aria-hidden="true"
            >
              <Mono style={{ fontSize: 16, letterSpacing: 1.5 }}>
                {actLabel}
              </Mono>
            </div>
          </Col>
        </div>
      </div>
    </Box>
  );
}
