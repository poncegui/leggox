import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import leggoxLogo from '../Assets/images/logo-nuevo-leggox.png';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
};

export default function StaticHeader() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { setIsCartOpen, getItemCount } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const toggleCart = () => setIsCartOpen(prev => !prev);
  const totalItems = getItemCount();

  // Ocultar cuando se hace scroll (para dar paso al TopBar)
  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY <= 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check inicial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.black,
        borderBottom: `2px solid ${COLORS.red}`,
        zIndex: 9997,
        padding: '12px 20px',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
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
        </a>

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
    </div>
  );
}
