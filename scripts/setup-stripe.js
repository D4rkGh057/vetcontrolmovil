#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Stripe para VetControl...\n');

// Verificar si existe .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Archivo .env creado desde .env.example');
        console.log('⚠️  Por favor, actualiza las claves de Stripe en .env');
    } else {
        console.log('❌ No se encontró .env.example');
    }
} else {
    console.log('ℹ️  Archivo .env ya existe');
}

// Verificar package.json para dependencias de Stripe
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies['@stripe/stripe-react-native']) {
        console.log('✅ Dependencia @stripe/stripe-react-native encontrada');
    } else {
        console.log('❌ Dependencia @stripe/stripe-react-native no encontrada');
        console.log('   Ejecuta: npm install @stripe/stripe-react-native');
    }
}

console.log('\n📋 Checklist de configuración:');
console.log('1. ✅ Componentes de Stripe implementados');
console.log('2. ✅ Servicio de Stripe configurado');
console.log('3. ✅ Modal de pago creado');
console.log('4. ✅ Integración en PagosScreen completa');
console.log('5. ⚠️  Configura las claves de Stripe en .env');
console.log('6. ⚠️  Verifica que el backend esté configurado');
console.log('7. ⚠️  Prueba el flujo de pago completo');

console.log('\n🚀 Para iniciar:');
console.log('1. Configura tus claves de Stripe en .env');
console.log('2. Inicia el backend con los endpoints de Stripe');
console.log('3. Ejecuta: npm start');
console.log('4. Prueba un pago con tarjeta de prueba: 4242 4242 4242 4242');

console.log('\n📖 Ver STRIPE_IMPLEMENTATION.md para más detalles');
