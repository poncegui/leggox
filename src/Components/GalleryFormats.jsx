import React, { useEffect, useState } from "react";

/**
 * GalleryFormats
 * Editorial gallery-style component
 * No sequence, no CTA
 * RN-friendly, responsive, accessible
 */

const COLORS = {
  bg: "#F6EFE6",
  ink: "#000000",
  ink70: "rgba(0,0,0,0.70)",
  ink40: "rgba(0,0,0,0.40)",
  line: "#A9D6E5",
  card: "rgba(255,255,255,0.5)",
};

const toRoman = (n) => {
  const map = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  for (const [v, s] of map) {
    while (n >= v) {
      res += s;
      n -= v;
    }
  }
  return res;
};

function editionLabel(index) {
  return `${toRoman(index + 1)}/VII`;
}

const FORMATS = [
  {
    id: "TABULA",
    title: "TABULA",
    subtitle: "Acrylic wall piece",
    img: "/img/tabula.jpg",
    edition: editionLabel(0),
  },
  {
    id: "MENSUS_OVALIS",
    title: "MENSUS OVALIS",
    subtitle: "Oval table · wood or metal legs",
    img: "/img/mensus-ovalis.jpg",
    edition: editionLabel(1),
  },
  {
    id: "FIGURA_SACRA",
    title: "FIGURA SACRA",
    subtitle: "Acrylic figure · glitter",
    img: "/img/figura-sacra.jpg",
    edition: editionLabel(2),
  },
  {
    id: "MENSUS_ORBIS",
    title: "MENSUS ORBIS",
    subtitle: "Round table · Ø35 cm",
    img: "/img/mensus-orbis.jpg",
    edition: editionLabel(3),
  },
];

export default function GalleryFormats() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmall = windowWidth < 480;

  return (
    <section
      aria-labelledby="gallery-formats-title"
      style={{
        backgroundColor: COLORS.bg,
        padding: isMobile ? "40px 20px" : "56px 20px",
      }}
    >
      {/* Accessible hidden title */}
      <h2
        id="gallery-formats-title"
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Available formats
      </h2>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 36,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <div
            style={{
              fontSize: isSmall ? 28 : isMobile ? 32 : 34,
              fontWeight: 900,
              letterSpacing: -0.8,
            }}
          >
            /. Formats
          </div>

          <div
            aria-hidden="true"
            style={{
              marginTop: 10,
              width: 220,
              height: 3,
              backgroundColor: COLORS.line,
              margin: isMobile ? "10px auto 0" : "10px 0 0",
            }}
          />

          <div
            style={{
              marginTop: 14,
              fontSize: 15,
              color: COLORS.ink70,
              maxWidth: 520,
              margin: isMobile ? "14px auto 0" : "14px 0 0",
            }}
          >
            Available formats within the ONLY 7 COLLECTION.
          </div>
        </div>

        {/* Grid */}
        <div
          role="list"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          {FORMATS.map((item) => (
            <article
              key={item.id}
              role="listitem"
              tabIndex={0}
              style={{
                flex: isMobile ? "0 1 auto" : "1 1 220px",
                minWidth: isMobile ? 280 : 220,
                maxWidth: isMobile ? 340 : 260,
                width: isMobile ? "100%" : "auto",
                backgroundColor: COLORS.card,
                borderRadius: 18,
                overflow: "hidden",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(169,214,229,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image */}
              <div
                aria-hidden="true"
                style={{
                  height: 220,
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {/* Text */}
              <div
                style={{
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      letterSpacing: 0.6,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.ink40,
                    }}
                  >
                    {item.edition}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: COLORS.ink70,
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
