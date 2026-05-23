# 📋 Guía de Logging - VetControl Mobile

## 🔧 Sistema de Logging Implementado

Se ha implementado un sistema de logging básico para monitorear el flujo de login y registro en la aplicación.

### 📁 Archivos Modificados

1. **`services/logger.ts`** - Servicio de logging nuevo
2. **`services/api.ts`** - Logs de peticiones HTTP 
3. **`stores/authStore.ts`** - Logs del estado de autenticación
4. **`screens/LoginScreen.tsx`** - Logs de la interfaz de usuario

### 🔍 Tipos de Logs Disponibles

#### Niveles de Log:
- `DEBUG` - Información detallada para desarrollo
- `INFO` - Información general del flujo
- `WARN` - Advertencias
- `ERROR` - Errores

#### Logs Específicos de Autenticación:
- `🔐 loginAttempt()` - Cuando se inicia un intento de login
- `✅ loginSuccess()` - Cuando el login es exitoso
- `❌ loginError()` - Cuando ocurre un error en login
- `📝 registerAttempt()` - Cuando se inicia un registro
- `✅ registerSuccess()` - Cuando el registro es exitoso
- `❌ registerError()` - Cuando ocurre un error en registro

#### Logs de API:
- `🌐 apiRequest()` - Peticiones salientes
- `📡 apiResponse()` - Respuestas exitosas
- `💥 apiError()` - Errores de API

### 🔍 Información que se Loggea en Login

#### En LoginScreen:
```
🚀 Iniciando proceso de login desde LoginScreen
- email: usuario@email.com
- passwordLength: 8
- hasEmail: true
- hasPassword: true
```

#### En AuthStore:
```
🔐 Intento de login iniciado
- email: usuario@email.com

🌐 API Request: POST /auth/login
- email: usuario@email.com
- password: [DATA]

📡 API Response: POST /auth/login - 200
- access_token: [DATA]
- user: [DATA]

🔑 Token recibido del servidor
- tokenLength: 123
- tokenPreview: eyJhbGciOiJIUzI1NiIs...

👤 Datos del usuario recibidos
- userId: 1
- email: usuario@email.com
- nombre: Juan
- apellido: Pérez
- rol: cliente

💾 Datos guardados en AsyncStorage

✅ Login exitoso
- userId: 1
- email: usuario@email.com
- nombre: Juan
```

### 🔍 Información que se Loggea en Registro

#### Datos enviados al servidor:
```
📝 Intento de registro iniciado
- email: nuevo@email.com
- nombre: Juan
- apellido: Pérez
- telefono: 555-1234
- rol: cliente

📤 Enviando datos de registro
- email: nuevo@email.com
- password: [HIDDEN]
- nombre: Juan
- apellido: Pérez
- telefono: 555-1234
- rol: cliente
```

### 🛠️ Cómo Ver los Logs

1. **En Metro/Expo**: Los logs aparecen en la consola de Metro
2. **En React Native Debugger**: En la consola del debugger
3. **En dispositivo**: Usando herramientas como Flipper o React Native Logs

### 🔒 Seguridad

- Las contraseñas **NO** se loggean completamente
- Solo se muestra la longitud de la contraseña
- Los tokens se muestran parcialmente (primeros 20 caracteres)
- Los logs solo se muestran en modo desarrollo (`__DEV__`)

### 🚀 Cómo Usar

Los logs se ejecutan automáticamente. Para ver información adicional:

```typescript
import { logger } from '../services/logger';

// Log básico
logger.info('Mi mensaje', { data: 'valor' });

// Log de error
logger.error('Error específico', error);

// Log de debug
logger.debug('Información detallada', { debug: true });
```

### 📱 Próximos Pasos

1. Probar el login/registro y revisar la consola
2. Verificar que los datos se envían correctamente
3. Identificar posibles problemas en el flujo
4. Ajustar la configuración del servidor si es necesario

---

**Nota**: Todos los logs están configurados para mostrarse solo en modo desarrollo para no afectar el rendimiento en producción.
