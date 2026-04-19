import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import leggoxLogo from '../Assets/images/logo-nuevo-leggox.png';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
};

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { setIsCartOpen, getItemCount } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const toggleCart = () => setIsCartOpen(prev => !prev);
  const totalItems = getItemCount();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar topbar después de hacer scroll de 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check inicial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para volver a inicio
  const goToHome = () => {
    if (isHomePage) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      navigate('/');
    }
  };

  // Función de búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Scroll a la sección de catálogo
      const catalogoSection = document.getElementById('catalogo');
      if (catalogoSection) {
        catalogoSection.scrollIntoView({ behavior: 'smooth' });
      }
      // Aquí podrías implementar filtrado de productos
      console.log('Buscando:', searchQuery);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.black,
        borderBottom: `2px solid ${COLORS.red}`,
        zIndex: 9998,
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isVisible ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Primera fila: Logo + Iconos */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Logo */}
        <button
          onClick={goToHome}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          aria-label="Volver al inicio"
        >
          <img
            src={leggoxLogo}
            alt="LEGGOX"
            style={{
              height: 40,
              width: 'auto',
              display: 'block',
            }}
          />
        </button>

        {/* Navegación rápida - Solo desktop */}
        <nav
          style={{
            display: window.innerWidth < 768 ? 'none' : 'flex',
            gap: 24,
            alignItems: 'center',
            flex: 1,
            marginLeft: 40,
          }}
        >
          <a
            href="#catalogo"
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '1.5px',
              color: COLORS.white,
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.white)}
          >
            CATÁLOGO
          </a>
          <a
            href="#buscador"
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '1.5px',
              color: COLORS.white,
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.white)}
          >
            BUSCADOR
          </a>
        </nav>

        {/* Iconos de acción */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Botón Carrito */}
          <button
            onClick={toggleCart}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: COLORS.white,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.white)}
            aria-label="Carrito de compras"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {/* Badge contador */}
            {totalItems > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: COLORS.red,
                  color: COLORS.white,
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 900,
                  border: `2px solid ${COLORS.black}`,
                }}
              >
                {totalItems}
              </div>
            )}
          </button>

          {/* Botón Usuario */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowUserMenu(!showUserMenu);
                } else {
                  openAuthModal('login');
                }
              }}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                color: COLORS.white,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.red)}
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.white)}
              aria-label="Mi cuenta"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {isAuthenticated && (
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: '#10B981',
                    borderRadius: '50%',
                    width: 8,
                    height: 8,
                    border: `2px solid ${COLORS.black}`,
                  }}
                />
              )}
            </button>

            {/* Dropdown del usuario */}
            {isAuthenticated && showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  backgroundColor: COLORS.white,
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  minWidth: 200,
                  overflow: 'hidden',
                  zIndex: 10000,
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    borderBottom: `1px solid ${COLORS.gray}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.black,
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      marginTop: 4,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 12,
                      color: COLORS.black,
                      opacity: 0.6,
                    }}
                  >
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.red,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.gray)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segunda fila: Buscador - estilo Lidl */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: COLORS.black,
          padding: '12px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="¿Qué estás buscando?"
              aria-label="Campo de búsqueda"
              style={{
                width: '100%',
                padding: '14px 60px 14px 20px',
                borderRadius: 8,
                border: searchFocused
                  ? `2px solid ${COLORS.red}`
                  : '2px solid rgba(255,255,255,0.2)',
                outline: 'none',
                fontFamily: 'APERCU, sans-serif',
                fontSize: 15,
                backgroundColor: COLORS.white,
                color: COLORS.black,
                transition: 'all 0.2s',
              }}
            />
            <button
              type="submit"
              aria-label="Iniciar búsqueda"
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: COLORS.red,
                border: 'none',
                borderRadius: 6,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.white}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
