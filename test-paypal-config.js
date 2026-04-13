#!/usr/bin/env node

/**
 * Test: Verificar configuración de PayPal
 * Uso: node test-paypal-config.js
 */

console.log('🏦 Test de Configuración PayPal\n');
console.log('='.repeat(60));

const fs = require('fs');
const path = require('path');

// ✅ Verificar archivos .env
console.log('\n1️⃣  Verificando archivos .env...');

const frontendEnvPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'server', '.env');

const frontendEnvExists = fs.existsSync(frontendEnvPath);
const backendEnvExists = fs.existsSync(backendEnvPath);

if (frontendEnvExists) {
  console.log('   ✅ Frontend .env existe');
} else {
  console.log('   ❌ Frontend .env NO existe');
}

if (backendEnvExists) {
  console.log('   ✅ Backend .env existe');
} else {
  console.log('   ❌ Backend .env NO existe');
}

// ✅ Leer variables
console.log('\n2️⃣  Leyendo variables de configuración...');

let frontendConfig = {};
let backendConfig = {};

if (frontendEnvExists) {
  const content = fs.readFileSync(frontendEnvPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && !key.startsWith('#')) {
      frontendConfig[key] = value || '';
    }
  });
}

if (backendEnvExists) {
  const content = fs.readFileSync(backendEnvPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && !key.startsWith('#')) {
      backendConfig[key] = value || '';
    }
  });
}

// ✅ Verificar PayPal Frontend
console.log('\n3️⃣  Frontend PayPal:');
const clientId = frontendConfig.REACT_APP_PAYPAL_CLIENT_ID;
if (clientId && clientId.trim()) {
  console.log(`   ✅ REACT_APP_PAYPAL_CLIENT_ID configurado`);
  console.log(`      Valor: ${clientId.substring(0, 10)}...`);
} else {
  console.log('   ⚠️  REACT_APP_PAYPAL_CLIENT_ID NO configurado');
  console.log('      Acción: Llena REACT_APP_PAYPAL_CLIENT_ID en .env');
}

// ✅ Verificar PayPal Backend
console.log('\n4️⃣  Backend PayPal:');
const backendClientId = backendConfig.PAYPAL_CLIENT_ID;
const backendSecret = backendConfig.PAYPAL_CLIENT_SECRET;
const paypalEnv = backendConfig.PAYPAL_ENV || 'sandbox';

if (backendClientId && backendClientId.trim()) {
  console.log(`   ✅ PAYPAL_CLIENT_ID configurado`);
  console.log(`      Valor: ${backendClientId.substring(0, 10)}...`);
} else {
  console.log('   ⚠️  PAYPAL_CLIENT_ID NO configurado');
}

if (backendSecret && backendSecret.trim()) {
  console.log(`   ✅ PAYPAL_CLIENT_SECRET configurado`);
  console.log(`      Valor: ${backendSecret.substring(0, 10)}...`);
} else {
  console.log('   ⚠️  PAYPAL_CLIENT_SECRET NO configurado');
}

console.log(`   ℹ️  Entorno: ${paypalEnv}`);

// ✅ Verificar API_BASE
console.log('\n5️⃣  Configuración de API:');
const apiBase = frontendConfig.REACT_APP_API_BASE;
if (apiBase && apiBase.trim()) {
  console.log(`   ✅ REACT_APP_API_BASE: ${apiBase}`);
} else {
  console.log('   ⚠️  REACT_APP_API_BASE no configurado');
}

// ✅ Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN:');
console.log('='.repeat(60));

const hasAllConfig = clientId?.trim() && backendClientId?.trim() && backendSecret?.trim();

if (hasAllConfig) {
  console.log('\n✅ ¡Configuración lista para usar PayPal!');
  console.log('\n🚀 Próximos pasos:');
  console.log('   1. npm start           (en la carpeta raíz para React)');
  console.log('   2. cd server && npm run dev  (en otra terminal)');
  console.log('   3. Abre http://localhost:3000');
  console.log('   4. Prueba el checkout con PayPal');
} else {
  console.log('\n⚠️  Faltan credenciales de PayPal');
  console.log('\n📝 Qué hacer:');
  console.log('   1. Ve a https://developer.paypal.com');
  console.log('   2. Apps & Credentials → Sandbox');
  console.log('   3. Copia tu Client ID y Client Secret');
  console.log('   4. Abre .env y server/.env');
  console.log('   5. Pega los valores');
  console.log('   6. Reinicia los servidores');
  console.log('\n📖 Lee PAYPAL_SETUP.md para instrucciones detalladas');
}

console.log('\n');
process.exit(hasAllConfig ? 0 : 1);
