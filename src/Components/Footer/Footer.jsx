import React from "react";

const COLORS = {
  bg: "#F6EFE6",
  ink: "#000000",
  ink70: "rgba(0,0,0,0.70)",
  ink40: "rgba(0,0,0,0.40)",
  line: "#A9D6E5",
};

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Footer"
      style={{
        backgroundColor: COLORS.bg,
        padding: "48px 20px 32px",
        borderTop: `1px solid ${COLORS.ink40}`,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Accent line */}
        <div
          aria-hidden="true"
          style={{
            width: 120,
            height: 2,
            backgroundColor: COLORS.line,
          }}
        />

        {/* Brand block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: -0.3,
            }}
          >
            Lola Gun Studio
          </div>

          <div
            style={{
              fontSize: 13,
              color: COLORS.ink70,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            ONLY 7 COLLECTION — EACH ONE UNIQUE
          </div>
        </div>

        {/* Contact block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontSize: 14,
          }}
        >
          <FooterLink
            href="https://www.instagram.com/lolagunstudio"
            label="Instagram"
          />

          <FooterLink
            href="mailto:studio@lolagunstudio.com"
            label="studio@lolagunstudio.com"
          />

          <div
            style={{
              fontSize: 13,
              color: COLORS.ink70,
            }}
          >
            Spain
          </div>
        </div>

        {/* Bottom note */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 12,
            color: COLORS.ink40,
          }}
        >
          <div>© {new Date().getFullYear()} Lola Gun Studio</div>
          <div>Handcrafted · Only 7</div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={label}
      style={{
        color: "#000000",
        textDecoration: "none",
        fontWeight: 600,
        outline: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(169,214,229,0.5)";
        e.currentTarget.style.borderRadius = "4px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {label}
    </a>
  );
}
