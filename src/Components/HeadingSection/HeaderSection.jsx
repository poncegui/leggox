import './HeaderSection.css';

import React from 'react';

import Carousel from './Carousel';
import leggoxBrand from '../../Assets/images/logo-nuevo-leggox.png';
import LeggoxRaceGame from '../LeggoxRaceGame';
import { useCart } from '../../context/CartContext';

// ✅ ICONOS SVG TÉCNICOS LEGGOX Y JUEGO
function IconOffer(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.3s ease', ...props.style }}
    >
      <path d="M12 2c2 3 5 5 5 9a5 5 0 1 1-10 0c0-2 1-4 2-6" />
      <path d="M10 14a2 2 0 1 0 4 0c0-1-.5-2-1-3" />
    </svg>
  );
}

function IconDownload(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.3s ease', ...props.style }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M12 15V3" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.3s ease', ...props.style }}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8a3 3 0 0 0-3 3" />
    </svg>
  );
}
function IconContact(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.3s ease', ...props.style }}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 8.5 5.5a2 2 0 0 0 2 0L22 7" />
    </svg>
  );
}

function IconGamepad(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.3s ease', ...props.style }}
    >
      <path d="M6 12h4m2 0h4M8 8h.01M16 8h.01M8 16h.01M16 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconCart(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.3s ease', ...props.style }}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

const HeaderSection = () => {
  const { setIsCartOpen, getItemCount } = useCart();
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showGame, setShowGame] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const navItems = [
    {
      label: 'Ofertas',
      icon: IconOffer,
      primary: true,
      style: { background: '#E01E37', color: '#FFFFFF' },
      onClick: () => {
        const sections = document.querySelectorAll('section');
        if (sections[0]) sections[0].scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
      },
    },
    {
      label: 'Descargar catálogo 2025',
      icon: IconDownload,
      primary: true,
      onClick: () => {
        // Descargar el PDF desde /catalogo-2025.pdf (colocar el archivo en /public)
        try {
          const link = document.createElement('a');
          link.href = '/catalogo-leggox-2025.pdf';
          link.setAttribute('download', 'catalogo-leggox-2025.pdf');
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (err) {
          // Fallback: abrir en nueva pestaña
          window.open('/catalogo-leggox-2025.pdf', '_blank');
        }
        setMenuOpen(false);
      },
    },
    {
      label: 'Buscar',
      icon: IconSearch,
      onClick: () => {
        // Ir a Buscador por modelo de vehículo (BuscadorPiezas)
        const sections = document.querySelectorAll('section');
        if (sections[2]) sections[2].scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
      },
    },
    {
      label: 'Contacto',
      icon: IconContact,
      onClick: () => {
        // Ir al footer
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
        setMenuOpen(false);
      },
    },
  ];

  return (
    <header
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: isMobile ? '20px 5%' : '40px 5%',
      }}
      role="banner"
    >
      {/* Carrusel de imágenes de fondo */}
      <Carousel />

      {/* Contenido del header - Centrado */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: isMobile ? '20px' : '30px',
        }}
      >
        {/* Logo con fondo */}
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.85)',
            padding: isMobile ? '30px 20px' : '40px 50px',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '700px',
            position: 'relative',
          }}
        >
          <img
            src={leggoxBrand}
            alt="Leggox - Ingenius Parts"
            style={{
              width: '100%',
              maxWidth: isMobile ? '280px' : '450px',
              height: 'auto',
              margin: '0 auto',
              display: 'block',
            }}
          />
          <div
            style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#E01E37',
              margin: '20px auto 0',
              borderRadius: '2px',
            }}
          />

          {/* Botón del juego - Play redondo */}
          <button
            onClick={() => setShowGame(true)}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#E01E37',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(224, 30, 55, 0.6)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow =
                '0 12px 32px rgba(224, 30, 55, 0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(224, 30, 55, 0.6)';
            }}
            aria-label="Jugar a LEGGOX Race"
            title="Jugar a LEGGOX Race"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#FFFFFF',
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '1px',
              }}
            >
              JUEGO
            </span>
          </button>

          {/* Botón del carrito - Shopping cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: '2px solid #E01E37',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#E01E37';
              e.currentTarget.style.borderColor = '#E01E37';
              e.currentTarget.style.boxShadow =
                '0 12px 32px rgba(224, 30, 55, 0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.borderColor = '#E01E37';
              e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(0, 0, 0, 0.6)';
            }}
            aria-label="Ver carrito de compra"
            title="Carrito de compra"
          >
            <IconCart style={{ color: '#FFFFFF' }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#FFFFFF',
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '1px',
              }}
            >
              CARRITO
            </span>
            {getItemCount() > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#E01E37',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #000000',
                }}
              >
                {getItemCount()}
              </div>
            )}
          </button>
        </div>

        {/* Botones de navegación */}
        <div
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '600px',
          }}
        >
          {isMobile ? (
            // Menú hamburguesa en mobile
            <div style={{ width: '100%' }}>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '18px 24px',
                  backgroundColor: '#E01E37',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(224,30,55,0.4)',
                  transition: 'all 0.3s ease',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú de navegación"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '2px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      transition: 'all 0.3s ease',
                      transform: menuOpen
                        ? 'rotate(45deg) translateY(6px)'
                        : 'none',
                    }}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: '2px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      transition: 'all 0.3s ease',
                      opacity: menuOpen ? 0 : 1,
                    }}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: '2px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '2px',
                      transition: 'all 0.3s ease',
                      transform: menuOpen
                        ? 'rotate(-45deg) translateY(-6px)'
                        : 'none',
                    }}
                  />
                </div>
                <span>{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
              </button>

              {menuOpen && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      zIndex: 999,
                      animation: 'fadeIn 0.3s ease',
                    }}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    style={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      borderRadius: '24px',
                      padding: '24px',
                      width: '90%',
                      maxWidth: '400px',
                      boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      zIndex: 1000,
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      animation: 'slideUp 0.3s ease',
                    }}
                  >
                    {navItems.map((item, index) => (
                      <button
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          padding: '18px 24px',
                          backgroundColor: item.primary
                            ? '#E01E37'
                            : 'rgba(255,255,255,0.05)',
                          border: item.primary
                            ? 'none'
                            : '2px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          color: '#FFFFFF',
                          fontSize: '16px',
                          fontWeight: '700',
                          fontFamily:
                            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          animation: `fadeInUp 0.4s ease ${
                            index * 0.05
                          }s forwards`,
                          opacity: 0,
                        }}
                        onClick={item.onClick}
                      >
                        <item.icon
                          style={{
                            width: 22,
                            height: 22,
                            color: item.primary ? '#FFFFFF' : undefined,
                          }}
                        />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            // Botones normales en desktop
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {navItems.map((item, index) => (
                <button
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px 20px',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily:
                      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    fontSize: '15px',
                    fontWeight: '700',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    backgroundColor: item.primary
                      ? '#E01E37'
                      : 'rgba(255,255,255,0.95)',
                    color: item.primary ? '#FFFFFF' : '#000000',
                    ...(item.style || {}),
                  }}
                  aria-label={`Ver ${item.label.toLowerCase()}`}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform =
                      'translateY(-4px) scale(1.05)';
                    e.currentTarget.style.boxShadow = item.primary
                      ? '0 8px 24px rgba(224,30,55,0.5)'
                      : '0 8px 24px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 16px rgba(0,0,0,0.3)';
                  }}
                  onClick={item.onClick}
                >
                  <item.icon
                    style={{
                      width: 22,
                      height: 22,
                      color: item.primary ? '#FFFFFF' : undefined,
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Juego LEGGOX Race */}
      {showGame && <LeggoxRaceGame onClose={() => setShowGame(false)} />}
    </header>
  );
};

export default HeaderSection;
