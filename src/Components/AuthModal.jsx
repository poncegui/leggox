import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  red: '#E01E37',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  lightGray: '#F5F5F5',
  border: '#E5E5E5',
};

// Iconos
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authView, switchAuthView, login, register } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Formulario de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Formulario de registro
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacyAccepted: false,
  });

  React.useEffect(() => {
    if (isAuthModalOpen) {
      setIsVisible(true);
      setError('');
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isAuthModalOpen]);

  const handleClose = () => {
    closeAuthModal();
    setError('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', privacyAccepted: false });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginData.email, loginData.password);

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!registerData.privacyAccepted) {
      setError('Debes aceptar la política de privacidad para continuar');
      return;
    }

    setLoading(true);

    const result = await register({
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      password: registerData.password,
    });

    if (!result.success) {
      setError(result.error || 'Error al crear la cuenta');
    }

    setLoading(false);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        opacity: isAuthModalOpen ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: COLORS.white,
          borderRadius: 20,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          transform: isAuthModalOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 30px',
            borderBottom: `1px solid ${COLORS.lightGray}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: 24,
              fontWeight: 800,
              color: COLORS.black,
              margin: 0,
            }}
          >
            {authView === 'login' ? 'Iniciar sesión' : authView === 'register' ? 'Crear cuenta' : 'Recuperar contraseña'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.lightGray;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <IconX />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
          {/* Error message */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #EF4444',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
                color: '#991B1B',
                fontFamily: 'APERCU, sans-serif',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* Vista de Login */}
          {authView === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 8,
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.gray,
                      opacity: 0.5,
                    }}
                  >
                    <IconMail />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="tu@email.com"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 8,
                  }}
                >
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.gray,
                      opacity: 0.5,
                    }}
                  >
                    <IconLock />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#CCCCCC' : COLORS.red,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 12,
                  padding: '16px',
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: 16,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#C01830';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = COLORS.red;
                }}
              >
                {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    color: COLORS.gray,
                    margin: 0,
                  }}
                >
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthView('register')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: COLORS.red,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Créala aquí
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Vista de Registro */}
          {authView === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.black,
                      marginBottom: 8,
                    }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    placeholder="Nombre"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.black,
                      marginBottom: 8,
                    }}
                  >
                    Apellidos
                  </label>
                  <input
                    type="text"
                    required
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    placeholder="Apellidos"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 8,
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.gray,
                      opacity: 0.5,
                    }}
                  >
                    <IconMail />
                  </div>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="tu@email.com"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 8,
                  }}
                >
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.gray,
                      opacity: 0.5,
                    }}
                  >
                    <IconLock />
                  </div>
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.black,
                    marginBottom: 8,
                  }}
                >
                  Confirmar contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: COLORS.gray,
                      opacity: 0.5,
                    }}
                  >
                    <IconLock />
                  </div>
                  <input
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: 12,
                      fontFamily: 'APERCU, sans-serif',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.red}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.border}
                  />
                </div>
              </div>

              {/* Política de privacidad */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 13,
                    color: COLORS.gray,
                    lineHeight: '1.5',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={registerData.privacyAccepted}
                    onChange={(e) => setRegisterData({ ...registerData, privacyAccepted: e.target.checked })}
                    style={{
                      marginTop: 4,
                      width: 18,
                      height: 18,
                      cursor: 'pointer',
                      accentColor: COLORS.red,
                    }}
                  />
                  <span>
                    He leído y acepto la{' '}
                    <a
                      href="/politica-privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: COLORS.red,
                        textDecoration: 'underline',
                        fontWeight: 600,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Política de Privacidad
                    </a>
                    {' '}y los{' '}
                    <a
                      href="/terminos-condiciones"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: COLORS.red,
                        textDecoration: 'underline',
                        fontWeight: 600,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Términos y Condiciones
                    </a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#CCCCCC' : COLORS.red,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: 12,
                  padding: '16px',
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: 16,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#C01830';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = COLORS.red;
                }}
              >
                {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 14,
                    color: COLORS.gray,
                    margin: 0,
                  }}
                >
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthView('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: COLORS.red,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
