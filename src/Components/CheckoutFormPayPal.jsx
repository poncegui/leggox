import React from "react";
import PayPalCheckout from "./PayPalCheckout";
import { useCreateOrder } from "../hooks/useProducts";

export default function CheckoutFormPayPal({ product, colors, onPaid }) {
  const { createOrder } = useCreateOrder();
  const INPUT_STYLE = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    outline: "none",
    fontFamily: "APERCU, sans-serif",
    fontSize: 14,
  };

  const [shipping, setShipping] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "ES",
    notes: "",
  });

  const [touched, setTouched] = React.useState({});

  const [status, setStatus] = React.useState(null);

  const price = Number(product?.price || 0);
  const canPay = price > 0;

  const errors = {
    fullName: String(shipping.fullName || "").trim().length === 0,
    email: !/^\S+@\S+\.\S+$/.test(shipping.email || ""),
    phone: String(shipping.phone || "").trim().length === 0,
    address1: String(shipping.address1 || "").trim().length === 0,
    city: String(shipping.city || "").trim().length === 0,
    province: String(shipping.province || "").trim().length === 0,
    postalCode: String(shipping.postalCode || "").trim().length === 0,
    country: String(shipping.country || "").trim().length === 0,
  };

  const isValid = Object.values(errors).every(e => e === false);

  const setField = (k, v) =>
    setShipping((s) => ({ ...s, [k]: v }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* FORM */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 14,
          padding: 12,
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "2px",
            color: colors.red,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          DATOS DE ENVÍO
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <input
              style={INPUT_STYLE}
              placeholder="Nombre y apellidos *"
              value={shipping.fullName}
              onChange={e => setField("fullName", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, fullName: true }))}
            />
            {touched.fullName && errors.fullName ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Escribe tu nombre completo.
              </div>
            ) : null}
          </div>

          <div>
            <input
              style={INPUT_STYLE}
              placeholder="Email *"
              value={shipping.email}
              onChange={e => setField("email", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
            />
            {touched.email && errors.email ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Email no válido.
              </div>
            ) : null}
          </div>

          <div>
            <input
              style={INPUT_STYLE}
              placeholder="Teléfono *"
              value={shipping.phone}
              onChange={e => setField("phone", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, phone: true }))}
            />
            {touched.phone && errors.phone ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Teléfono requerido.
              </div>
            ) : null}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <input
              style={INPUT_STYLE}
              placeholder="Dirección *"
              value={shipping.address1}
              onChange={e => setField("address1", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, address1: true }))}
            />
            {touched.address1 && errors.address1 ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Dirección requerida.
              </div>
            ) : null}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <input
              style={INPUT_STYLE}
              placeholder="Piso / puerta (opcional)"
              value={shipping.address2}
              onChange={e => setField("address2", e.target.value)}
            />
          </div>

          <div>
            <input
              style={INPUT_STYLE}
              placeholder="Ciudad *"
              value={shipping.city}
              onChange={e => setField("city", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, city: true }))}
            />
            {touched.city && errors.city ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Ciudad requerida.
              </div>
            ) : null}
          </div>

          <div>
            <input
              style={INPUT_STYLE}
              placeholder="Provincia *"
              value={shipping.province}
              onChange={e => setField("province", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, province: true }))}
            />
            {touched.province && errors.province ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Provincia requerida.
              </div>
            ) : null}
          </div>

          <div>
            <input
              style={INPUT_STYLE}
              placeholder="Código postal *"
              value={shipping.postalCode}
              onChange={e => setField("postalCode", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, postalCode: true }))}
            />
            {touched.postalCode && errors.postalCode ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                Código postal requerido.
              </div>
            ) : null}
          </div>

          <div>
            <select
              style={INPUT_STYLE}
              value={shipping.country}
              onChange={e => setField("country", e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, country: true }))}
            >
              <option value="ES">España</option>
              <option value="PT">Portugal</option>
              <option value="FR">Francia</option>
              <option value="DE">Alemania</option>
              <option value="IT">Italia</option>
            </select>
            {touched.country && errors.country ? (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
                País requerido.
              </div>
            ) : null}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <textarea
              style={{ ...INPUT_STYLE, minHeight: 84, resize: "vertical" }}
              placeholder="Notas para el envío (opcional)"
              value={shipping.notes}
              onChange={e => setField("notes", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* PAYPAL */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 14,
          padding: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "2px",
              color: colors.gray,
              fontWeight: 800,
            }}
          >
            PAGO
          </div>

          <div
            style={{
              fontFamily: "APERCU, sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: colors.black,
            }}
          >
            {canPay ? `${price.toFixed(2).replace(".", ",")} €` : "Consultar"}
          </div>
        </div>

        {!canPay ? (
          <div style={{ fontFamily: "APERCU, sans-serif", color: colors.gray }}>
            Este producto no tiene precio configurado.
          </div>
        ) : !isValid ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.08)",
              fontFamily: "APERCU, sans-serif",
              fontWeight: 700,
              color: colors.gray,
            }}
          >
            Completa los campos obligatorios (*) para activar el pago.
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                letterSpacing: "2px",
                color: colors.red,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              PASARELA PAYPAL
            </div>

            <PayPalCheckout
              cart={{
                items: [
                  {
                    id: product.id,
                    title: product.title,
                    qty: 1,
                    unitPrice: price,
                  },
                ],
                total: price.toFixed(2),
                currency: "EUR",
                shipping,
              }}
              customer={shipping}
              onBeforePayment={async (paypalOrderId) => {
                // Crear pedido en nuestra base de datos antes de pagar
                try {
                  const orderResult = await createOrder({
                    cart: {
                      items: [{
                        id: product.id,
                        title: product.title,
                        qty: 1,
                        unitPrice: price,
                      }],
                      total: price,
                      currency: "EUR",
                    },
                    customer: shipping,
                    paypalOrderId,
                  });
                  return orderResult.order?.order_id;
                } catch (err) {
                  console.error("Error creando pedido:", err);
                  return null;
                }
              }}
              onSuccess={(details) => {
                setStatus("ok");
                onPaid?.(details, shipping);
              }}
              onError={() => setStatus("error")}
            />

            {status === "error" ? (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  fontFamily: "APERCU, sans-serif",
                  fontWeight: 800,
                }}
              >
                ❌ Error en el pago. Prueba de nuevo.
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
