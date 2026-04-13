import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'carparts_cookie_consent_v2';

const DEFAULT_CONSENT = {
  necessary: true,
  analytics: false,
  personalization: false,
  marketing: false,
  decided: false,
  updatedAt: null,
};

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getConsent() {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;

  return {
    ...DEFAULT_CONSENT,
    ...(parsed || {}),
    necessary: true,
  };
}

export function saveConsent(consent) {
  if (typeof window === 'undefined') return;

  const payload = {
    ...DEFAULT_CONSENT,
    ...consent,
    necessary: true,
    decided: true,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(
    new CustomEvent('cookie-consent-changed', { detail: payload }),
  );
}

export function canUseAnalytics() {
  return getConsent().analytics === true;
}

export function canUsePersonalization() {
  return getConsent().personalization === true;
}

export function canUseMarketing() {
  return getConsent().marketing === true;
}

export function canLoadCheckoutPaymentScripts() {
  return true;
}

export async function loadExternalScript({ src, id, attributes = {} }) {
  if (typeof document === 'undefined') return;

  if (id && document.getElementById(id)) return;

  const existing = Array.from(document.scripts).find(s => s.src === src);
  if (existing) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    if (id) script.id = id;

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`No se pudo cargar el script: ${src}`));

    document.body.appendChild(script);
  });
}

export function revokeOptionalCookies() {
  try {
    const optionalCookieNames = ['_ga', '_gid', '_gat', '_fbp', '_gcl_au'];

    optionalCookieNames.forEach(name => {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
    });
  } catch {
    // Silencioso
  }
}

function Toggle({ checked, disabled = false, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 52,
        height: 30,
        borderRadius: 999,
        border: 'none',
        background: checked ? '#E01E37' : '#d1d5db',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'all .2s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#fff',
          transition: 'all .2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,.15)',
        }}
      />
    </button>
  );
}

function PreferenceRow({ title, description, checked, disabled, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '16px 0',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#000000',
            marginBottom: 6,
            fontFamily: 'APERCU, sans-serif',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: '#4b5563',
            fontFamily: 'APERCU, sans-serif',
          }}
        >
          {description}
        </div>
      </div>

      <Toggle checked={checked} disabled={disabled} onChange={onChange} />
    </div>
  );
}

function CookieModal({
  open,
  preferencesMode,
  consent,
  setConsent,
  onAcceptAll,
  onRejectOptional,
  onSaveCustom,
  onClose,
  setPreferencesMode,
}) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configuración de cookies"
        style={{
          width: '100%',
          maxWidth: 820,
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,.22)',
          padding: 24,
          fontFamily: 'APERCU, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              color: '#000000',
              fontFamily: 'APERCU, sans-serif',
            }}
          >
            🍪 Configuración de cookies
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: '1px solid #e5e7eb',
              background: '#fff',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'APERCU, sans-serif',
            }}
          >
            ✕
          </button>
        </div>

        {!preferencesMode ? (
          <>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: '#374151',
                marginTop: 0,
                fontFamily: 'APERCU, sans-serif',
              }}
            >
              Utilizamos cookies propias y de terceros para garantizar el
              funcionamiento de la web, gestionar el carrito, el proceso de
              compra y los pagos, así como para análisis y preferencias. En
              determinados casos, integraciones de pago como PayPal o Aplazame
              pueden cargarse durante el checkout cuando sean necesarias para
              completar la transacción.
            </p>

            <p
              style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: '#4b5563',
                fontFamily: 'APERCU, sans-serif',
              }}
            >
              En nuestra tienda de piezas de coche usamos cookies para ayudarte
              a encontrar recambios más rápido, guardar tu carrito y comprar de
              forma segura.
            </p>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button type="button" onClick={onAcceptAll} style={buttonPrimary}>
                ✓ Aceptar
              </button>

              <button
                type="button"
                onClick={onRejectOptional}
                style={buttonSecondary}
              >
                ✕ Rechazar
              </button>

              <button
                type="button"
                onClick={() => setPreferencesMode(true)}
                style={buttonGhost}
              >
                ⚙️ Configurar cookies
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: '#374151',
                marginTop: 0,
                fontFamily: 'APERCU, sans-serif',
              }}
            >
              Puedes decidir qué cookies opcionales aceptas. Las cookies
              necesarias siempre están activas porque son imprescindibles para
              el funcionamiento de la tienda y del proceso de compra.
            </p>

            <PreferenceRow
              title="Cookies necesarias"
              description="Permiten la navegación, la sesión, el carrito, la seguridad, el proceso de compra y guardar tu elección sobre cookies."
              checked
              disabled
              onChange={() => {}}
            />

            <PreferenceRow
              title="Cookies de análisis"
              description="Nos ayudan a entender cómo navegan los usuarios por la tienda para mejorar categorías, fichas de producto y búsqueda de piezas."
              checked={consent.analytics}
              onChange={value =>
                setConsent(prev => ({ ...prev, analytics: value }))
              }
            />

            <PreferenceRow
              title="Cookies de personalización"
              description="Permiten recordar preferencias como idioma, piezas vistas recientemente o ciertos ajustes de navegación."
              checked={consent.personalization}
              onChange={value =>
                setConsent(prev => ({ ...prev, personalization: value }))
              }
            />

            <PreferenceRow
              title="Cookies publicitarias"
              description="Permiten mostrar anuncios o promociones más relevantes si utilizas herramientas de marketing o remarketing."
              checked={consent.marketing}
              onChange={value =>
                setConsent(prev => ({ ...prev, marketing: value }))
              }
            />

            <div
              style={{
                marginTop: 16,
                padding: 16,
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                background: '#f9fafb',
                color: '#000000',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 8,
                  fontFamily: 'APERCU, sans-serif',
                }}
              >
                ℹ️ Información sobre medios de pago
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#4b5563',
                  fontFamily: 'APERCU, sans-serif',
                }}
              >
                Los scripts o widgets de PayPal, Aplazame, Bizum o Santander no
                deberían cargarse en toda la web desde el inicio. Se activarán
                solo en checkout o cuando el usuario seleccione expresamente ese
                método de pago.
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={onSaveCustom}
                style={buttonPrimary}
              >
                ✓ Guardar
              </button>

              <button
                type="button"
                onClick={onRejectOptional}
                style={buttonSecondary}
              >
                ✕ Rechazar opcionales
              </button>

              <button type="button" onClick={onAcceptAll} style={buttonGhost}>
                ✓ Aceptar todas
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [preferencesMode, setPreferencesMode] = useState(false);
  const [consent, setConsent] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const current = getConsent();
    setConsent(current);
    setMounted(true);

    if (!current.decided) {
      setOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const next = {
      necessary: true,
      analytics: true,
      personalization: true,
      marketing: true,
    };
    setConsent({ ...next, decided: true });
    saveConsent(next);
    setOpen(false);
    setPreferencesMode(false);
  };

  const handleRejectOptional = () => {
    const next = {
      necessary: true,
      analytics: false,
      personalization: false,
      marketing: false,
    };
    setConsent({ ...next, decided: true });
    saveConsent(next);
    revokeOptionalCookies();
    setOpen(false);
    setPreferencesMode(false);
  };

  const handleSaveCustom = () => {
    saveConsent(consent);
    if (!consent.analytics || !consent.personalization || !consent.marketing) {
      revokeOptionalCookies();
    }
    setOpen(false);
    setPreferencesMode(false);
  };

  const handleClose = () => {
    if (getConsent().decided) {
      setOpen(false);
      setPreferencesMode(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <CookieModal
        open={open}
        preferencesMode={preferencesMode}
        consent={consent}
        setConsent={setConsent}
        onAcceptAll={handleAcceptAll}
        onRejectOptional={handleRejectOptional}
        onSaveCustom={handleSaveCustom}
        onClose={handleClose}
        setPreferencesMode={setPreferencesMode}
      />

      {getConsent().decided && !open && (
        <button
          type="button"
          onClick={() => {
            setPreferencesMode(true);
            setOpen(true);
          }}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 9999,
            background: '#fff',
            color: '#000000',
            border: '1px solid #E01E37',
            borderRadius: 999,
            padding: '10px 14px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'APERCU, sans-serif',
            boxShadow: '0 10px 30px rgba(0,0,0,.12)',
          }}
        >
          🍪 Cookies
        </button>
      )}
    </>
  );
}

const buttonPrimary = {
  border: 'none',
  borderRadius: 12,
  padding: '12px 16px',
  background: '#E01E37',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'APERCU, sans-serif',
};

const buttonSecondary = {
  border: '1px solid #d1d5db',
  borderRadius: 12,
  padding: '12px 16px',
  background: '#fff',
  color: '#000000',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'APERCU, sans-serif',
};

const buttonGhost = {
  border: 'none',
  borderRadius: 12,
  padding: '12px 16px',
  background: '#f3f4f6',
  color: '#000000',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'APERCU, sans-serif',
};
