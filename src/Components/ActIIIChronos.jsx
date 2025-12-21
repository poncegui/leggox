import React, { useEffect, useMemo, useState } from "react";

/**
 * ACT III — CHRONOS (RN-friendly Web)
 * - Responsive (column mobile / row desktop)
 * - Accessible (region landmark + headings)
 * - Styles in JS objects (easy to migrate to React Native StyleSheet)
 * - Gallery aesthetic (not ecommerce)
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

export default function ActIIIChronos({
  titleTop = "/. CHRONOS",
  subtitle = "Time is part of the process.",
  mainText = [
    "Each piece in the ONLY 7 COLLECTION is made slowly and by hand.",
    "We ask for time. We ask for patience.",
    "",
    "If you choose your own ingredients, time begins when they are selected or received.",
    "For all other pieces, the preparation time is 15 days.",
    "",
    "Chronos shapes the work.",
    "Waiting is part of owning something unique.",
  ],
  footerNote = "Handcrafted pieces require time. Thank you for waiting.",
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
      minHeight: isWide ? "600px" : "auto",
      justifyContent: "center",
      gap: 0,
    }),
    [isWide],
  );

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="act3-heading"
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
        id="act3-heading"
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Act III Chronos module
      </Text>

      <div style={layoutStyle}>
        {/* RIGHT PANEL - Title */}
        <div
          style={{
            width: isWide ? "70%" : "100%",
            backgroundColor: COLORS.charcoal,
            padding: isWide ? "80px 60px" : "40px 24px",
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
                fontSize: isWide ? 80 : 48,
                fontWeight: 700,
                fontFamily: "APERCU",
                lineHeight: 1.02,
              }}
            >
              {titleTop}
            </Text>
          </Col>
        </div>

        {/* LEFT PANEL - Content */}
        <div
          style={{
            width: isWide ? "30%" : "100%",
            backgroundColor: COLORS.offWhite,
            padding: isWide ? "80px 40px" : "40px 24px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col style={{ gap: 18, maxWidth: 420 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: -0.3,
                fontFamily: "APERCU",
              }}
            >
              {subtitle}
            </Text>

            <div style={{ height: 1, backgroundColor: COLORS.ink20 }} />

            {/* Main text */}
            <Col style={{ gap: 14 }}>
              {mainText.map((paragraph, idx) => (
                <Text
                  key={idx}
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: paragraph === "" ? "transparent" : COLORS.ink70,
                  }}
                >
                  {paragraph || "\u00A0"}
                </Text>
              ))}
            </Col>

            <div
              style={{ height: 1, backgroundColor: COLORS.ink20, marginTop: 8 }}
            />

            {/* Footer note */}
            <Mono
              style={{
                fontSize: 12,
                color: COLORS.ink70,
                fontStyle: "italic",
                marginTop: 8,
              }}
            >
              {footerNote}
            </Mono>

            {/* ACT III badge */}
            <div className="ActoContainerBlue">Act III.</div>
          </Col>
        </div>
      </div>

      {/* Accessibility note for screen readers (optional) */}
      <Text
        as="p"
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Time and craftsmanship: each piece requires patience and careful
        preparation.
      </Text>
    </Box>
  );
}
