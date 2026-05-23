import { create } from 'zustand';
import { Mascota } from '../types';
import { mascotasService } from '../services/api';
import { logger } from '../services/logger';

interface MascotasState {
  // Estado
  mascotas: Mascota[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  getMascotasByDueño: (dueñoId: string) => Promise<void>;
  addMascota: (mascota: any) => Promise<void>;
  updateMascota: (id: string, mascota: any) => Promise<void>;
  deleteMascota: (id: string) => Promise<void>;
  clearMascotas: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMascotasStore = create<MascotasState>((set, get) => ({
  // Estado inicial
  mascotas: [],
  loading: false,
  error: null,

  // Acciones
  getMascotasByDueño: async (dueñoId: string) => {
    try {
      set({ loading: true, error: null });
      logger.info('🐕 Cargando mascotas del dueño:', dueñoId);
      
      const response = await mascotasService.getMascotasByDueño(dueñoId);
      
      set({ mascotas: response.data, loading: false });
      logger.info('✅ Mascotas cargadas exitosamente:', response.data.length);
    } catch (error: any) {
      logger.error('❌ Error cargando mascotas:', error);
      set({ 
        error: error.response?.data?.message || 'Error al cargar las mascotas',
        loading: false 
      });
      throw error;
    }
  },

  addMascota: async (mascotaData: any) => {
    try {
      set({ loading: true, error: null });
      logger.info('➕ Agregando nueva mascota:', mascotaData);
      
      const response = await mascotasService.createMascota(mascotaData);
      const nuevaMascota = response.data;
      
      const { mascotas } = get();
      set({ 
        mascotas: [...mascotas, nuevaMascota],
        loading: false 
      });
      
      logger.info('✅ Mascota agregada exitosamente:', nuevaMascota);
    } catch (error: any) {
      logger.error('❌ Error agregando mascota:', error);
      set({ 
        error: error.response?.data?.message || 'Error al agregar la mascota',
        loading: false 
      });
      throw error;
    }
  },

  updateMascota: async (id: string, mascotaData: any) => {
    try {
      set({ loading: true, error: null });
      logger.info('✏️ Actualizando mascota:', { id, data: mascotaData });
      
      const response = await mascotasService.patchMascota(id, mascotaData);
      const mascotaActualizada = response.data;
      
      const { mascotas } = get();
      const mascotasActualizadas = mascotas.map(mascota => {
        if (mascota.id_mascota === id) {
          // Asegurar que mantenemos todas las propiedades necesarias
          return {
            ...mascota,
            ...mascotaActualizada,
            // Asegurar que las propiedades críticas no se pierdan
            id_mascota: mascota.id_mascota,
            nombre: mascotaActualizada.nombre || mascota.nombre,
            especie: mascotaActualizada.especie || mascota.especie,
            raza: mascotaActualizada.raza || mascota.raza,
            sexo: mascotaActualizada.sexo || mascota.sexo,
            color: mascotaActualizada.color || mascota.color,
            id_usuario: mascota.id_usuario
          };
        }
        return mascota;
      });
      
      set({ 
        mascotas: mascotasActualizadas,
        loading: false 
      });
      
      logger.info('✅ Mascota actualizada exitosamente:', mascotaActualizada);
    } catch (error: any) {
      logger.error('❌ Error actualizando mascota:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la mascota',
        loading: false 
      });
      throw error;
    }
  },

  deleteMascota: async (id: string) => {
    try {
      set({ loading: true, error: null });
      logger.info('🗑️ Eliminando mascota:', id);
      
      await mascotasService.deleteMascota(id);
      
      const { mascotas } = get();
      const mascotasFiltradas = mascotas.filter(mascota => mascota.id_mascota !== id);
      
      set({ 
        mascotas: mascotasFiltradas,
        loading: false 
      });
      
      logger.info('✅ Mascota eliminada exitosamente');
    } catch (error: any) {
      logger.error('❌ Error eliminando mascota:', error);
      set({ 
        error: error.response?.data?.message || 'Error al eliminar la mascota',
        loading: false 
      });
      throw error;
    }
  },

  clearMascotas: () => {
    set({ mascotas: [], error: null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));
