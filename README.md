# VetControl Mobile - Aplicación Veterinaria

## 📱 Instalación de Dependencias

Para que la aplicación funcione correctamente, ejecuta los siguientes comandos en la terminal:

```bash
# Instalar dependencias de navegación
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack

# Instalar dependencias para React Native
npm install react-native-screens react-native-safe-area-context

# Instalar cliente HTTP
npm install axios

# Instalar AsyncStorage para autenticación
npm install @react-native-async-storage/async-storage

# Instalar Zustand para manejo de estado
npm install zustand

# Si usas Expo (recomendado)
npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage
```

## 🏗️ Arquitectura de la Aplicación

### Estructura de Carpetas
```
screens/          # Pantallas de la aplicación
├── LoginScreen.tsx
├── HomeScreen.tsx
├── MascotasScreen.tsx
├── CitasScreen.tsx
├── RecordatoriosScreen.tsx
└── PerfilScreen.tsx

services/         # Servicios para API
└── api.ts

types/           # Definiciones de tipos TypeScript
└── index.ts

contexts/        # Contextos de React (estado global)
└── AuthContext.tsx

stores/          # Stores de Zustand (manejo de estado)
└── authStore.ts

components/      # Componentes reutilizables
├── Container.tsx
└── TabIcon.tsx
```

### Funcionalidades Implementadas

#### 🔐 Sistema de Autenticación
- Pantalla de login con validación
- Registro de nuevos usuarios
- Manejo seguro de tokens JWT
- Persistencia de sesión con AsyncStorage
- Auto-login al abrir la app

#### 🏠 Pantalla de Inicio (HomeScreen)
- Resumen de próximas citas
- Recordatorios pendientes
- Lista de mascotas registradas
- Funcionalidad de refresh

#### 🐕 Pantalla de Mascotas (MascotasScreen)
- Lista completa de mascotas
- Iconos dinámicos según especie
- Vista de detalles al tocar una mascota
- Botón para agregar nueva mascota

#### 📅 Pantalla de Citas (CitasScreen)
- Lista de todas las citas
- Filtros por estado (programada, completada, cancelada)
- Indicadores visuales de estado
- Detalles de cada cita

#### 🔔 Pantalla de Recordatorios (RecordatoriosScreen)
- Recordatorios de vacunas, medicamentos y desparasitación
- Filtros por estado (pendientes, completados)
- Indicadores de recordatorios vencidos
- Marcar como completado

#### 👤 Pantalla de Perfil (PerfilScreen)
- Información del usuario logueado
- Configuración de la cuenta
- Opciones de ayuda y soporte
- Cerrar sesión con confirmación
- Información de la aplicación

## 🔧 Configuración del Backend

Asegúrate de que tu backend NestJS esté ejecutándose y actualiza la URL en `services/api.ts`:

```typescript
const BASE_URL = 'http://TU_IP:3000'; // Cambia por la IP de tu backend
```

### Para diferentes entornos:
- **Emulador Android**: `http://10.0.2.2:3000`
- **Dispositivo físico**: `http://TU_IP_LOCAL:3000`
- **iOS Simulator**: `http://localhost:3000`

## 🚀 Ejecutar la Aplicación

```bash
# Iniciar el servidor de desarrollo
npm start

# Para Android
npm run android

# Para iOS
npm run ios
```

## 📱 Navegación

La aplicación utiliza una navegación por pestañas en la parte inferior con 5 secciones principales:

1. **Inicio** 🏠 - Dashboard con resumen
2. **Mascotas** 🐕 - Gestión de mascotas
3. **Citas** 📅 - Gestión de citas veterinarias
4. **Recordatorios** 🔔 - Recordatorios de cuidado
5. **Perfil** 👤 - Perfil de usuario y configuración

### 🔐 Flujo de Autenticación

La aplicación implementa un sistema completo de autenticación:

1. **Al abrir la app**: Verifica si hay una sesión guardada
2. **Sin sesión**: Muestra la pantalla de login/registro
3. **Con sesión válida**: Navega directamente al dashboard
4. **Logout**: Limpia los datos y regresa al login

## 🔑 Credenciales de Prueba

Para probar la aplicación, puedes usar cualquier email válido con una contraseña de tu elección.

## 🎨 Estilos

La aplicación utiliza:
- **NativeWind** para estilos con Tailwind CSS
- **Diseño responsive** que se adapta a diferentes tamaños de pantalla
- **Iconos emoji** para una interfaz amigable
- **Colores consistentes** con el tema de la aplicación

## 🔮 Próximas Funcionalidades

- Formularios para agregar/editar mascotas
- Formularios para agendar citas
- Historial médico detallado
- Notificaciones push para recordatorios
- ~~Autenticación de usuarios~~ ✅ **Implementado**
- Fotografías de mascotas
- Exportar datos en PDF
- Modo offline
- Configuración de notificaciones

## 🛠️ Solución de Problemas

### Error de Metro/Expo
Si encuentras errores al ejecutar la aplicación:
```bash
npx expo start --clear
```

### Error de navegación
Asegúrate de que todas las dependencias estén instaladas:
```bash
npm install
```

### Error de conexión API
Verifica que:
1. El backend esté ejecutándose
2. La URL en `api.ts` sea correcta
3. No haya problemas de CORS en el backend

### Error de autenticación
Si tienes problemas con el login:
1. Verifica que el endpoint `/auth/login` esté funcionando
2. Revisa que el backend retorne `access_token` y `user`
3. Limpia el almacenamiento: Settings > Apps > VetControl > Storage > Clear Data
