import React from "react";

const INTRO_LINES = [
  [{ text: "Be one of us. Be unique.", bold: false }],
  [
    { text: "Handcrafted acrylic works", bold: true },
    { text: "Only 7 Collection", bold: false },
  ],
  [
    { text: "We hunt the treasure", bold: false },
    { text: "We encapsulate it forever, creating unique pieces.", bold: false },
  ],
];

export const WebDesignContainer = () => {
  return (
    <div style={styles.container} role="region" aria-label="Introduction">
      {INTRO_LINES.map((line, lineIndex) => (
        <div key={lineIndex} style={styles.textLine}>
          {line.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.bold ? (
                <span style={styles.boldText}>{item.text}</span>
              ) : (
                <span style={styles.regularText}>{item.text}</span>
              )}
              {idx < line.length - 1 && (
                <span style={styles.separator}> — </span>
              )}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 720,
  },
  textLine: {
    fontFamily: "ANONYMOUS, sans-serif",
    fontSize: 16,
    lineHeight: 1.6,
    color: "rgba(0,0,0,0.85)",
  },
  boldText: {
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  regularText: {
    fontWeight: 400,
  },
  separator: {
    opacity: 0.5,
  },
};
