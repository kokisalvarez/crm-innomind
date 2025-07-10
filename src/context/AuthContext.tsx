import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Verificar si hay una sesión guardada al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (savedToken && savedUser) {
          // Verificar que el token siga siendo válido
          const user = await authService.getCurrentUser(savedToken);
          
          setAuthState({
            user,
            token: savedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      } catch (error) {
        // Token inválido o expirado, limpiar datos guardados
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_refresh_token');
        
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Validar credenciales
      if (!authService.validateEmail(credentials.email)) {
        throw new Error('Por favor ingresa un correo electrónico válido');
      }

      if (!authService.validatePassword(credentials.password)) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Intentar autenticación
      const authResponse = await authService.signIn(credentials);

      // Guardar datos en localStorage
      localStorage.setItem('auth_token', authResponse.token);
      localStorage.setItem('auth_user', JSON.stringify(authResponse.user));
      localStorage.setItem('auth_refresh_token', authResponse.refreshToken);

      // Actualizar estado
      setAuthState({
        user: authResponse.user,
        token: authResponse.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido al iniciar sesión'
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({
      ...prev,
      isLoading: true
    }));

    try {
      // Invalidar token en el servidor si existe
      if (authState.token) {
        await authService.signOut(authState.token);
      }
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
      // Continuamos con el logout local aunque falle el servidor
    } finally {
      // Limpiar datos locales
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_refresh_token');

      // Resetear estado
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      // Redirigir a login
      window.location.href = '/login';
    }
  };

  const clearError = () => {
    setAuthState(prev => ({
      ...prev,
      error: null
    }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};