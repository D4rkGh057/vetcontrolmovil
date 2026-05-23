import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
} as any);

// Solicitar permisos para notificaciones
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    console.log('🔒 Solicitando permisos para notificaciones...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('🔒 Estado actual de permisos:', existingStatus);
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('🔒 Solicitando permisos explícitamente...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
      console.log('🔒 Resultado de solicitud de permisos:', finalStatus);
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Permisos de notificación denegados');
      return false;
    }
    
    console.log('✅ Permisos de notificación concedidos');
    return true;
  } catch (error) {
    console.error('❌ Error solicitando permisos de notificación:', error);
    return false;
  }
};

// Programar una notificación para un recordatorio
export const scheduleRecordatorioNotification = async (
  recordatorioId: string,
  titulo: string,
  descripcion: string,
  fechaLimite: string
): Promise<string | null> => {
  console.log('🚀 Iniciando programación de notificación en notifications.ts');
  console.log('Parámetros recibidos:');
  console.log('- recordatorioId:', recordatorioId);
  console.log('- titulo:', titulo);
  console.log('- descripcion:', descripcion);
  console.log('- fechaLimite:', fechaLimite);
  try {
    // Verificar permisos primero
    const hasPermissions = await requestNotificationPermissions();
    if (!hasPermissions) {
      console.log('❌ No hay permisos para programar notificación');
      return null;
    }

    // Imprimir la fecha límite recibida para depuración
    console.log('📆 Fecha recibida para notificación:', fechaLimite);
    console.log('📆 Tipo de dato:', typeof fechaLimite);
    
    // Parsear la fecha límite - asegurando que no haya problema con el formato
    let fechaNotificacion;
    try {
      fechaNotificacion = new Date(fechaLimite);
      
      // Mostrar información detallada de zona horaria para depuración
      console.log('📆 Fecha parseada:');
      console.log('- ISO (UTC):', fechaNotificacion.toISOString());
      console.log('- Local:', fechaNotificacion.toLocaleString());
      console.log('- Offset zona horaria (minutos):', fechaNotificacion.getTimezoneOffset());
      
      // Verificar si es una fecha válida
      if (isNaN(fechaNotificacion.getTime())) {
        console.log('❌ Fecha inválida recibida');
        return null;
      }
    } catch (error) {
      console.log('❌ Error al parsear la fecha:', error);
      return null;
    }
    
    // Obtener la fecha actual
    const ahora = new Date();
    console.log('📆 Fecha actual:', ahora.toISOString());
    
    // Usar nuestra función de utilidad para ver información detallada de la fecha
    debugDate('Fecha de notificación antes de ajustes', fechaNotificacion);
    
    // Si la fecha ya tiene una hora específica (como 08:00), respetamos esa hora
    const tieneHoraEspecifica = fechaLimite.includes('T');
    console.log('📆 ¿Tiene hora específica?', tieneHoraEspecifica);
    
    if (!tieneHoraEspecifica) {
      // Si no tiene hora específica, configuramos para las 8:00 AM en hora local
      fechaNotificacion.setHours(8, 0, 0, 0);
      console.log('📆 Fecha ajustada a 8:00 AM:');
      debugDate('Después de ajustar a 8:00 AM', fechaNotificacion);
    }
    
    // Comparar fechas para debug
    console.log('📆 Fecha notificación < ahora?', fechaNotificacion < ahora);
    
    // Si la fecha de notificación ya pasó, verificar si es por la hora o por el día
    if (fechaNotificacion < ahora) {
      console.log('⚠️ La hora de notificación ya pasó para hoy');
      
      // Verificar si es el mismo día
      const esMismoDia = 
        fechaNotificacion.getDate() === ahora.getDate() &&
        fechaNotificacion.getMonth() === ahora.getMonth() &&
        fechaNotificacion.getFullYear() === ahora.getFullYear();
      
      console.log('📆 ¿Es el mismo día?', esMismoDia);
      
      // Si es la misma fecha pero después de las 8:00 AM, programar para mañana
      if (esMismoDia) {
        console.log('🔄 Programando para el día siguiente a las 8:00 AM');
        fechaNotificacion.setDate(fechaNotificacion.getDate() + 1);
        console.log('📆 Nueva fecha de notificación:', fechaNotificacion.toISOString());
      } else {
        // Si es una fecha pasada, usar la primera hora disponible (5 segundos desde ahora para pruebas)
        console.log('⚠️ La fecha seleccionada es anterior a hoy, usando fecha actual + 5 segundos');
        fechaNotificacion = new Date(Date.now() + 5000);
      }
    }
    
    // Calcular segundos hasta la fecha de notificación
    let secondsUntilNotification = Math.floor((fechaNotificacion.getTime() - Date.now()) / 1000);
    
    // Si la fecha ya pasó, programar para 10 segundos en el futuro
    if (secondsUntilNotification <= 0) {
      console.log('❌ La fecha de notificación ya pasó, se programará para 10 segundos');
      secondsUntilNotification = 10;
    }
    
    console.log('⏱️ Segundos hasta la notificación:', secondsUntilNotification);

    // Programar la notificación usando segundos desde ahora (formato correcto según documentación)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Recordatorio VetControl',
        body: `${titulo}: ${descripcion}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          recordatorioId,
          type: 'recordatorio',
        },
      },
      trigger: {
        seconds: secondsUntilNotification > 0 ? secondsUntilNotification : 10,
        channelId: 'default',
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });

    console.log(
      `✅ Notificación programada:
      - Fecha original: ${new Date(fechaLimite).toLocaleString()}
      - Fecha notificación (local): ${fechaNotificacion.toLocaleString()}
      - Fecha notificación (ISO/UTC): ${fechaNotificacion.toISOString()}
      - Segundos para notificación: ${secondsUntilNotification}
      - ID: ${notificationId}`
    );
    return notificationId;
  } catch (error) {
    console.error('❌ Error programando notificación:', error);
    return null;
  }
};

// Cancelar una notificación programada
export const cancelRecordatorioNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`✅ Notificación cancelada: ${notificationId}`);
  } catch (error) {
    console.error('❌ Error cancelando notificación:', error);
  }
};

// Obtener todas las notificaciones programadas
export const getScheduledNotifications = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📅 Notificaciones programadas:', scheduled.length);
    return scheduled;
  } catch (error) {
    console.error('❌ Error obteniendo notificaciones programadas:', error);
    return [];
  }
};

// Programar notificación de prueba (para testing)
export const scheduleTestNotification = async (): Promise<void> => {
  try {
    const hasPermissions = await requestNotificationPermissions();
    if (!hasPermissions) {
      console.log('⚠️ No se puede enviar notificación de prueba: permisos denegados');
      return;
    }

    console.log('🧪 Programando notificación de prueba para 10 segundos desde ahora');
    
    // Usar el formato correcto según la documentación de Expo Notifications
    const testId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Notificación de Prueba',
        body: 'Esta es una notificación de prueba para VetControl',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 10,
        channelId: 'default',
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
      },
    });
    
    console.log('🧪 ID de notificación de prueba:', testId);
    console.log('✅ Notificación de prueba programada para 10 segundos');
  } catch (error) {
    console.error('❌ Error programando notificación de prueba:', error);
  }
};

// Función de utilidad para depuración de fechas
const debugDate = (label: string, date: Date): void => {
  console.log(`📅 ${label}:`);
  console.log(`- ISO (UTC): ${date.toISOString()}`);
  console.log(`- Local: ${date.toLocaleString()}`);
  console.log(`- Fecha local: ${date.toLocaleDateString()}`);
  console.log(`- Hora local: ${date.toLocaleTimeString()}`);
  console.log(`- Offset zona horaria (minutos): ${date.getTimezoneOffset()}`);
  console.log(`- Getters locales - Día: ${date.getDate()}, Mes: ${date.getMonth() + 1}, Año: ${date.getFullYear()}, Hora: ${date.getHours()}:${date.getMinutes()}`);
};

// Inicializar las notificaciones
export const initNotifications = async (): Promise<void> => {
  try {
    console.log('🚀 Inicializando sistema de notificaciones...');
    
    // Verificar información de zona horaria y fechas actuales
    console.log('📅 Información de zona horaria:');
    const ahora = new Date();
    debugDate('Fecha actual', ahora);
    console.log('💻 Plataforma:', Platform.OS);
    
    // Prueba rápida de zona horaria
    const testDate = new Date('2025-07-04T08:00:00');
    debugDate('Fecha de prueba 08:00 AM', testDate);
    
    // Solicitar permisos
    const hasPermissions = await requestNotificationPermissions();
    if (!hasPermissions) {
      console.log('⚠️ No se pudieron obtener permisos para notificaciones');
      return;
    }
    
    // Crear el canal de notificaciones (solo Android)
    if (Platform.OS === 'android') {
      console.log('📱 Configurando canal de notificaciones para Android');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VetControl',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
      console.log('✅ Canal de notificaciones configurado');
    }
    
    console.log('✅ Sistema de notificaciones inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando notificaciones:', error);
  }
};
