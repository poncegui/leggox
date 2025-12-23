import React from "react";

/**
 * UNUM - ACT I
 * ONLY 7 COLLECTION - Color palette showcase
 * React Native friendly: inline styles, no styled-components
 */

const COLORS = {
  bg: "#333333",
  cream: "#F9EFE4",
  creamText: "rgba(249, 239, 228, 0.7)",
  ink: "#000000",
};

const PALETTE = [
  { hex: "#F5F5F5", label: "no 1/.7", color: "#E8E8E8" },
  { hex: "#CCCCCC", label: "no 2/.7", color: "#CCCCCC" },
  { hex: "#999999", label: "no 3/.7", color: "#999999" },
  { hex: "#666666", label: "no 4/.7", color: "#666666" },
  { hex: "#444444", label: "no 5/.7", color: "#444444" },
  { hex: "#222222", label: "no 6/.7", color: "#222222" },
  { hex: "#000000", label: "no 7/.7", color: "#000000" },
];

export default function Unum() {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 440;

  return (
    <section
      style={{
        ...styles.container,
        flexDirection: isMobile ? "column" : "row-reverse",
        gap: isMobile
          ? isSmall
            ? "1.5rem"
            : "2rem"
          : isTablet
            ? "3rem"
            : "7rem",
        padding: isMobile ? "3rem 1rem" : "0",
        height: isMobile ? "auto" : "100vh",
        alignItems: isMobile ? "center" : "center",
      }}
      aria-labelledby="act1-title"
    >
      {/* Title Section */}
      <div
        style={{
          ...styles.titleSection,
          width: isMobile ? "100%" : "70%",
          textAlign: isMobile ? "center" : "right",
          justifyContent: isMobile ? "center" : "center",
        }}
      >
        <h2
          id="act1-title"
          style={{
            ...styles.title,
            fontSize: isSmall ? 40 : isMobile ? 50 : isTablet ? 60 : 80,
            padding: isMobile ? "2% 3%" : "3% 5%",
          }}
        >
          /. ACT I — UNUM
        </h2>
        <p
          style={{
            ...styles.actCopy,
            fontSize: isSmall ? 12 : isMobile ? 13 : isTablet ? 13 : 14,
            padding: isMobile ? "0 3%" : "0 5%",
            margin: isMobile ? "0 auto" : "0",
          }}
        >
          UNUM — one of seven.
          {"\n"}
          Each piece is unique.
        </p>
      </div>

      {/* Palette Section */}
      <aside
        aria-labelledby="palette-title"
        style={{
          ...styles.paletteSection,
          width: isMobile ? "100%" : isTablet ? "40%" : "30%",
          maxWidth: isMobile ? "400px" : "none",
          padding: isMobile ? "2rem 1.5rem" : "2rem",
        }}
      >
        <h3
          id="palette-title"
          style={{
            position: "absolute",
            left: -9999,
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          Color Palette
        </h3>
        {PALETTE.map((item, index) => (
          <div key={index} style={styles.paletteItem}>
            <div
              style={{
                ...styles.hexText,
                fontSize: 16,
              }}
              aria-label={`Color ${index + 1}: ${item.hex}`}
            >
              {item.hex}
            </div>
            <div
              style={{
                ...styles.labelText,
                color: item.color,
                fontSize: isSmall ? 36 : isMobile ? 38 : isTablet ? 38 : 42,
              }}
              aria-hidden="true"
            >
              {item.label}
            </div>
          </div>
        ))}
        <div style={styles.actBadge} aria-hidden="true">
          Act I.
        </div>
      </aside>
    </section>
  );
}

const styles = {
  container: {
    margin: 0,
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
    // flexDirection, gap, padding, height - handled dynamically
  },
  titleSection: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontFamily: "APERCU, sans-serif",
    fontWeight: 400,
    color: COLORS.cream,
    marginBottom: "0.5rem",
    margin: 0,
  },
  actCopy: {
    maxWidth: 520,
    color: COLORS.creamText,
    lineHeight: 1.5,
    fontFamily: "APERCU, sans-serif",
    whiteSpace: "pre-line",
  },
  paletteSection: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: COLORS.cream,
    justifyContent: "center",
    alignItems: "center",
    textTransform: "uppercase",
  },
  paletteItem: {
    textAlign: "left",
    marginBottom: "0.5rem",
    width: "100%",
  },
  hexText: {
    color: COLORS.ink,
    fontFamily: "APERCU, sans-serif",
    margin: 0,
  },
  labelText: {
    fontFamily: "APERCU, sans-serif",
    textIndent: "1rem",
    margin: 0,
  },
  actBadge: {
    fontFamily: "APERCU, sans-serif",
    marginTop: "1rem",
  },
};
