import { create } from 'zustand';
import { Cita } from '../types';
import { citasService } from '../services/api';
import { logger } from '../services/logger';

interface CitasState {
  // Estado
  citas: Cita[];
  loading: boolean;
  error: string | null;

  // Acciones
  getCitas: () => Promise<void>;
  getCitaById: (id: string) => Promise<Cita>;
  addCita: (citaData: Partial<Cita>) => Promise<void>;
  updateCita: (id: string, citaData: Partial<Cita>) => Promise<void>;
  deleteCita: (id: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCitasStore = create<CitasState>((set, get) => ({
  // Estado inicial
  citas: [],
  loading: false,
  error: null,

  // Acciones
  getCitas: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('📅 Cargando citas...');
      
      const response = await citasService.getCitas();
      
      set({ citas: response.data, loading: false });
      logger.info('✅ Citas cargadas exitosamente:', response.data.length);
    } catch (error: any) {
      logger.error('❌ Error cargando citas:', error);
      set({ 
        error: error.response?.data?.message ?? 'Error al cargar las citas',
        loading: false 
      });
    }
  },

  getCitaById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      logger.info('📅 Cargando cita por ID:', id);
      
      const response = await citasService.getCita(id);
      
      set({ loading: false });
      logger.info('✅ Cita cargada exitosamente:', response.data.id_cita);
      return response.data;
    } catch (error: any) {
      logger.error('❌ Error cargando cita:', error);
      set({ 
        error: error.response?.data?.message ?? 'Error al cargar la cita',
        loading: false 
      });
      throw error;
    }
  },

  addCita: async (citaData: Partial<Cita>) => {
    try {
      set({ loading: true, error: null });
      logger.info('📅 Agregando nueva cita:', citaData);
      
      const response = await citasService.createCita(citaData);
      const { citas } = get();
      
      set({ 
        citas: [...citas, response.data],
        loading: false 
      });
      logger.info('✅ Cita agregada exitosamente:', response.data.id_cita);
    } catch (error: any) {
      logger.error('❌ Error agregando cita:', error);
      set({ 
        error: error.response?.data?.message ?? 'Error al agregar la cita',
        loading: false 
      });
      throw error;
    }
  },

  updateCita: async (id: string, citaData: Partial<Cita>) => {
    try {
      set({ loading: true, error: null });
      logger.info('📅 Actualizando cita:', { id, citaData });
      
      const response = await citasService.updateCita(id, citaData);
      const { citas } = get();
      
      set({ 
        citas: citas.map(cita => 
          cita.id_cita === id ? { ...cita, ...response.data } : cita
        ),
        loading: false 
      });
      logger.info('✅ Cita actualizada exitosamente:', id);
    } catch (error: any) {
      logger.error('❌ Error actualizando cita:', error);
      set({ 
        error: error.response?.data?.message ?? 'Error al actualizar la cita',
        loading: false 
      });
      throw error;
    }
  },

  deleteCita: async (id: string) => {
    try {
      set({ loading: true, error: null });
      logger.info('📅 Eliminando cita:', id);
      
      await citasService.deleteCita(id);
      const { citas } = get();
      
      set({ 
        citas: citas.filter(cita => cita.id_cita !== id),
        loading: false 
      });
      logger.info('✅ Cita eliminada exitosamente:', id);
    } catch (error: any) {
      logger.error('❌ Error eliminando cita:', error);
      set({ 
        error: error.response?.data?.message ?? 'Error al eliminar la cita',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));
