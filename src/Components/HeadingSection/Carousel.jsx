import React from "react";
// Imágenes de coches
import seat600 from "../../Assets/images/coches/seat-600.png";
import seat131 from "../../Assets/images/coches/seat-131.png";
import seatPanda from "../../Assets/images/coches/seat-panda.png";
import kitManguitos600 from "../../Assets/images/croquis/manguitos/croquis-manguito-motor.png";
import kitManguitos127 from "../../Assets/images/croquis/radiadores/radiador-aluminio-02.png";

const CAROUSEL_IMAGES = [
  {
    src: seat600,
    alt: "SEAT 600",
    title: "SEAT 600",
  },
  {
    src: kitManguitos600,
    alt: "Kit Manguitos SEAT 600",
    title: "MANGUITOS SEAT 600",
  },
  {
    src: seat131,
    alt: "SEAT 131",
    title: "SEAT 131",
  },
  {
    src: kitManguitos127,
    alt: "Kit Manguitos SEAT 127",
    title: "MANGUITOS SEAT 127",
  },
  {
    src: seatPanda,
    alt: "SEAT Panda",
    title: "SEAT PANDA",
  },
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  // Carrusel automático
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Carrusel de imágenes de fondo */}
      <div style={styles.carouselContainer}>
        {CAROUSEL_IMAGES.map((img, idx) => (
          <div
            key={idx}
            style={{
              ...styles.carouselSlide,
              opacity: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? "scale(1)" : "scale(1.1)",
            }}
          >
            {img.src ? (
              <img src={img.src} alt={img.alt} style={styles.carouselImage} />
            ) : (
              <div style={styles.carouselPlaceholder}>
                <div style={styles.placeholderText}>{img.title}</div>
              </div>
            )}
          </div>
        ))}
        <div style={styles.carouselOverlay} />
      </div>

      {/* Indicadores del carrusel */}
      <div style={styles.carouselIndicators}>
        {CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            style={{
              ...styles.indicator,
              backgroundColor:
                currentSlide === idx ? "#E01E37" : "rgba(255,255,255,0.5)",
            }}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </>
  );
};

export default Carousel;

const styles = {
  carouselContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  carouselSlide: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transition: "opacity 1s ease-in-out, transform 8s ease-in-out",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    filter: "grayscale(100%) brightness(1.2)",
  },
  carouselPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: "48px",
    fontWeight: 700,
    color: "#E01E37",
    fontFamily: "APERCU, sans-serif",
    letterSpacing: "-2px",
  },
  carouselOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)",
    zIndex: 1,
  },
  carouselIndicators: {
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "12px",
    zIndex: 10,
  },
  indicator: {
    width: "40px",
    height: "4px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    borderRadius: "2px",
  },
};
