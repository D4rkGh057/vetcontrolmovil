import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Container } from '../components/Container';
import { RecordatorioCard, RecordatorioFilters, EmptyRecordatorios, AddRecordatorioModal } from '../components/recordatorios';
import { useRecordatoriosStore } from '../stores/recordatoriosStore';
import { 
  scheduleRecordatorioNotification, 
  cancelRecordatorioNotification,
  scheduleTestNotification,
  getScheduledNotifications 
} from '../utils/notifications';
import {
  Plus,
  Bell
} from 'lucide-react-native';

export const RecordatoriosScreen = () => {
  const { 
    recordatorios, 
    loading, 
    getRecordatorios, 
    toggleComplete,
    deleteRecordatorio,
    addRecordatorio
  } = useRecordatoriosStore();
  
  const [filter, setFilter] = useState<'todos' | 'pendientes' | 'completados'>('pendientes');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadRecordatorios = async () => {
    try {
      setRefreshing(true);
      await getRecordatorios();
    } catch (error) {
      console.error('Error loading recordatorios:', error);
      Alert.alert('Error', 'No se pudieron cargar los recordatorios');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getRecordatorios();
  }, [getRecordatorios]);

  const handleToggleComplete = async (id: string, completado: boolean) => {
    try {
      // Si se marca como completado, cancelar la notificación
      if (completado) {
        const recordatorio = recordatorios.find(r => r.id_recordatorio === id);
        if (recordatorio?.notification_id) {
          await cancelRecordatorioNotification(recordatorio.notification_id);
          console.log(`✅ Notificación cancelada para recordatorio completado: ${recordatorio.notification_id}`);
        }
      } else {
        // Si se marca como no completado, reprogramar la notificación
        const recordatorio = recordatorios.find(r => r.id_recordatorio === id);
        if (recordatorio?.fecha_programada) {
          const notificationId = await scheduleRecordatorioNotification(
            recordatorio.id_recordatorio,
            recordatorio.titulo,
            recordatorio.descripcion,
            recordatorio.fecha_programada
          );
          
          if (notificationId) {
            console.log(`✅ Notificación reprogramada para recordatorio: ${notificationId}`);
          }
        }
      }
      
      await toggleComplete(id, completado);
      Alert.alert('Éxito', 'Recordatorio actualizado correctamente');
    } catch (error) {
      console.error('Error updating recordatorio:', error);
      Alert.alert('Error', 'No se pudo actualizar el recordatorio');
    }
  };

  const performDelete = async (id: string) => {
    try {
      // Cancelar notificación si existe
      const recordatorio = recordatorios.find(r => r.id_recordatorio === id);
      if (recordatorio?.notification_id) {
        await cancelRecordatorioNotification(recordatorio.notification_id);
        console.log(`✅ Notificación cancelada para recordatorio eliminado: ${recordatorio.notification_id}`);
      }
      
      await deleteRecordatorio(id);
      Alert.alert('Éxito', 'Recordatorio eliminado correctamente');
    } catch (error) {
      console.error('Error deleting recordatorio:', error);
      Alert.alert('Error', 'No se pudo eliminar el recordatorio');
    }
  };

  const handleDeleteRecordatorio = async (id: string) => {
    Alert.alert(
      'Eliminar Recordatorio',
      '¿Estás seguro de que quieres eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            performDelete(id).catch(console.error);
          }
        }
      ]
    );
  };

  const handleAddRecordatorio = () => {
    setShowAddModal(true);
  };

  const handleCreateRecordatorio = async (recordatorioData: any) => {
    try {
      // Debbugging
      console.log('🚀 Iniciando creación de recordatorio');
      
      await addRecordatorio(recordatorioData);
      console.log('✅ Recordatorio guardado en la base de datos');
      
      // Programar notificación para recordatorios no completados
      if (!recordatorioData.completado && recordatorioData.fecha_programada) {
        console.log('📅 Programando recordatorio:');
        console.log('- Fecha seleccionada:', recordatorioData.fecha_programada);
        console.log('- Tipo de dato:', typeof recordatorioData.fecha_programada);
        console.log('- Formato ISO de fecha:', new Date(recordatorioData.fecha_programada).toISOString());
        console.log('- Fecha actual:', new Date().toISOString());
        
        try {
          console.log('🔔 Intentando programar notificación...');
          const notificationId = await scheduleRecordatorioNotification(
            recordatorioData.id_recordatorio ?? `temp-${Date.now()}`,
            recordatorioData.titulo,
            recordatorioData.descripcion,
            recordatorioData.fecha_programada
          );
          
          if (notificationId) {
            console.log(`✅ Notificación programada para recordatorio: ${notificationId}`);
          }
        } catch (error) {
          console.error('❌ Error al programar la notificación:', error);
        }
      }
      
      // Recargar la lista de recordatorios
      await getRecordatorios();
    } catch (error) {
      // Re-lanzar el error para que el modal lo maneje
      console.error('Error in handleCreateRecordatorio:', error);
      throw error;
    }
  };

  const filteredRecordatorios = recordatorios.filter(recordatorio => {
    switch (filter) {
      case 'pendientes': return !recordatorio.completado;
      case 'completados': return recordatorio.completado;
      default: return true;
    }
  });

  // Debug: Verificar IDs únicos
  React.useEffect(() => {
    const ids = filteredRecordatorios.map(r => r.id_recordatorio);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('⚠️ IDs de recordatorios duplicados encontrados:', ids);
    }
    console.log('🔍 Recordatorios filtrados:', filteredRecordatorios.length, 'IDs:', ids);
  }, [filteredRecordatorios]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRecordatorios();
  };

  if (loading) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-600">Cargando recordatorios...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1 bg-neutral-50">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800">Recordatorios</Text>
          <View className="flex-row gap-2">
            {__DEV__ && (
              <>
                <TouchableOpacity
                  className="bg-orange-500 px-3 py-2 rounded-lg flex-row items-center"
                  onPress={async () => {
                    try {
                      console.log('🧪 Solicitando notificación de prueba...');
                      await scheduleTestNotification();
                      console.log('✅ Notificación de prueba programada');
                      Alert.alert('Notificación de prueba', 'Se programó una notificación para 5 segundos');
                    } catch (error) {
                      console.error('❌ Error al enviar notificación de prueba:', error);
                      Alert.alert('Error', 'No se pudo programar la notificación de prueba');
                    }
                  }}
                >
                  <Bell size={14} color="white" />
                  <Text className="text-white font-medium text-xs ml-1">Test</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-purple-500 px-3 py-2 rounded-lg"
                  onPress={async () => {
                    const scheduled = await getScheduledNotifications();
                    Alert.alert(
                      'Notificaciones programadas', 
                      `${scheduled.length} notificaciones encontradas\n${scheduled.map(n => n.content.title).join('\n')}`
                    );
                  }}
                >
                  <Text className="text-white font-medium text-xs">Ver</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              className="bg-primary-500 px-4 py-2 rounded-lg flex-row items-center"
              onPress={handleAddRecordatorio}
            >
              <Plus size={16} color="white" />
              <Text className="text-white font-semibold ml-1">Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-gray-600 mb-6">Mantén al día el cuidado de tus mascotas</Text>

        {/* Filtros */}
        <RecordatorioFilters
          activeFilter={filter}
          onFilterChange={setFilter}
        />

        {filteredRecordatorios.length === 0 ? (
          <EmptyRecordatorios
            filter={filter}
            onAddRecordatorio={handleAddRecordatorio}
          />
        ) : (
          <ScrollView 
            className="flex-1" 
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            } 
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-4 ">
              {filteredRecordatorios.map((recordatorio, index) => (
                <RecordatorioCard
                  key={recordatorio.id_recordatorio || `recordatorio-${index}`}
                  recordatorio={recordatorio}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteRecordatorio}
                />
              ))}
            </View>
          </ScrollView>
        )}
        
        {/* Modal para añadir recordatorio */}
        <AddRecordatorioModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateRecordatorio}
        />
      </View>
    </Container>
  );
};
