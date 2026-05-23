import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '../types';
import { authService, usuariosService } from '../services/api';
import { logger } from '../services/logger';

interface AuthState {
  // Estado
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  
  // Acciones
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateProfile: (userData: Partial<Usuario>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isLoading: true,
      isLoggedIn: false,

      // Acciones
      login: async (email: string, password: string) => {
        try {
          logger.loginAttempt(email);
          set({ isLoading: true });

          const response = await authService.login(email, password);
          const { access_token, user: rawUser } = response.data;

          if (!access_token || !rawUser) {
            throw new Error('Respuesta de login inválida');
          }

          // Map id_usuario → id to keep component API stable
          const user: Usuario = {
            id: rawUser.id_usuario,
            nombre: rawUser.nombre,
            apellido: rawUser.apellido,
            email: rawUser.email,
            rol: rawUser.rol,
            telefono: rawUser.telefono ?? undefined,
            direccion: rawUser.direccion ?? undefined,
          };

          await AsyncStorage.setItem('token', access_token);
          await AsyncStorage.setItem('user', JSON.stringify(user));

          set({ token: access_token, user, isLoggedIn: true, isLoading: false });
          logger.loginSuccess(user);
        } catch (error: any) {
          set({ isLoading: false });
          logger.loginError(error, email);
          throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
        }
      },

      register: async (userData: RegisterData) => {
        try {
          logger.registerAttempt(userData);
          set({ isLoading: true });
          await authService.register(userData);
          logger.registerSuccess();
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          logger.registerError(error, userData.email);
          throw new Error(error.response?.data?.message || 'Error al registrarse');
        }
      },

      logout: async () => {
        try {
          // Limpiar AsyncStorage
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          
          // Resetear estado
          set({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      checkAuthState: async () => {
        try {
          set({ isLoading: true });
          
          logger.debug('🔍 Verificando estado de autenticación');
          
          const storedToken = await AsyncStorage.getItem('token');
          const storedUser = await AsyncStorage.getItem('user');
          
          logger.debug('💾 Datos en AsyncStorage', {
            hasToken: !!storedToken,
            hasUser: !!storedUser,
            tokenPreview: storedToken ? storedToken.substring(0, 20) + '...' : null
          });
          
          if (storedToken && storedUser) {
            const user = JSON.parse(storedUser);
            
            logger.info('✅ Usuario autenticado encontrado', {
              userId: user.id,
              email: user.email,
              nombre: user.nombre
            });
            
            set({
              token: storedToken,
              user: user,
              isLoggedIn: true,
              isLoading: false,
            });
          } else {
            logger.info('❌ No hay usuario autenticado');
            set({
              user: null,
              token: null,
              isLoggedIn: false,
              isLoading: false,
            });
          }
        } catch (error) {
          logger.error('Error checking auth state:', error);
          console.error('Error checking auth state:', error);
          set({
            user: null,
            token: null,
            isLoggedIn: false,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateProfile: async (userData: Partial<Usuario>) => {
        try {
          const { user } = get();
          if (!user?.id) throw new Error('Usuario no autenticado');

          set({ isLoading: true });
          await usuariosService.updateUsuario(user.id, userData);

          const updatedUser = { ...user, ...userData };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message ?? 'Error al actualizar perfil');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
