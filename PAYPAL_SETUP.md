# 🏦 Configuración de PayPal - Leggox

## ⚠️ Estado Actual

- ❌ Variables PayPal **NO configuradas**
- ✅ Archivos `.env` creados
- ⏳ Esperando credenciales de PayPal

---

## 📝 Paso a Paso: Obtener Credenciales de PayPal

### **Paso 1: Ir a PayPal Developer**

1. Abre https://developer.paypal.com
2. Haz clic en "Sign In"
3. Inicia sesión con tu cuenta PayPal (o crea una)

### **Paso 2: Acceder al Dashboard**

1. Una vez logueado, ve a "Apps & Credentials"
2. Asegúrate de estar en la pestaña **"Sandbox"** (para pruebas)
   - Sandbox = Pruebas (no cobra dinero real)
   - Live = Producción (cobra dinero real)

### **Paso 3: Crear una Aplicación**

1. En la sección "Sandbox", haz clic en "Create App"
2. Dale un nombre: `Leggox Store`
3. Haz clic en "Create App"

### **Paso 4: Copiar Credenciales**

Verás dos secciones:

#### **REST API credentials (Sandbox)**

- **Client ID** ← Esta es la que necesitas en el frontend
- **Secret** ← Esta es la que necesitas en el backend

**Copiar:**

```
Client ID:   AaBbCcDdEe...
Secret:      FfGgHhIiJj...
```

---

## 🔧 Llenar los Archivos .env

### **Frontend (.env en la raíz del proyecto)**

Abre `/Users/marta/Desktop/leggox/.env` y completa:

```env
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_PAYPAL_CLIENT_ID=AaBbCcDdEe...  ← Pega aqui tu Client ID
```

### **Backend (server/.env)**

Abre `/Users/marta/Desktop/leggox/server/.env` y completa:

```env
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=AaBbCcDdEe...        ← Mismo Client ID
PAYPAL_CLIENT_SECRET=FfGgHhIiJj...    ← Pega tu Secret aqui
PORT=4000
```

---

## ✅ Verificar Configuración

### **1. Reinicia los servidores**

```bash
# Terminal 1: Backend
cd /Users/marta/Desktop/leggox/server
npm run dev

# Terminal 2: Frontend
cd /Users/marta/Desktop/leggox
npm start
```

### **2. Revisa los logs**

El backend debe decir:

```
✅ Base de datos inicializada
Payments API running on :4000
```

El frontend debe cargar sin errores de PayPal.

### **3. Test en el navegador**

1. Abre `http://localhost:3000`
2. Ve a la sección de checkout
3. Debería mostrar los botones de PayPal (no el error rojo)

---

## 🧪 Probar Pago de Prueba

**Cuentas de prueba de PayPal:**

| Tipo      | Email                            | Contraseña |
| --------- | -------------------------------- | ---------- |
| Vendedor  | sb-xxxxx...@business.example.com | Cualquiera |
| Comprador | sb-yyyyy...@personal.example.com | Cualquiera |

Estas cuentas se generan automáticamente en tu zona de Sandbox.

---

## 🚨 Problemas Comunes

### **"REACT_APP_PAYPAL_CLIENT_ID no está configurado"**

✅ Solución:

1. Abre `.env` en la raíz
2. Completa `REACT_APP_PAYPAL_CLIENT_ID=...`
3. Ejecuta `npm start` de nuevo

### **"OAuth error: Invalid client id"**

✅ Solución:

1. Verifica que copiaste el Client ID correctamente
2. Asegúrate de estár en SANDBOX (no Live)
3. Reinicia el backend

### **Botones de PayPal no aparecen**

✅ Solución:

1. Abre la consola del navegador (F12)
2. Busca errores en Network
3. Verifica que el backend está corriendo

---

## 📊 Flujo de Pago

```
Usuario hace clic en "Pagar con PayPal"
       ↓
React carga SDK de PayPal (usa REACT_APP_PAYPAL_CLIENT_ID)
       ↓
Usuario ve botones de PayPal
       ↓
Usuario hace clic en "Pagar"
       ↓
Backend crea orden con PayPal (usa PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET)
       ↓
usuario aprueba pago en PayPal
       ↓
Backend captura el pago
       ↓
Orden completada ✅
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**

- El `.env` está en `.gitignore` (no se sube a Git)
- El Client ID es público (está bien en el código)
- El Secret NUNCA debe estar en el frontend
- NUNCA hagas push del `.env` con credenciales reales

---

## 📞 Soporte

Si necesitas ayuda:

1. Ve a https://developer.paypal.com/docs
2. Revisa los logs del servidor: `npm run dev`
3. Abre la consola del navegador: `F12`
