import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserFilters, UserPagination, UserImportData, PasswordChangeRequest } from '../types/user';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: UserPagination;
  selectedUser: User | null;
  
  // Actions
  loadUsers: () => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'fechaRegistro' | 'historialActividad'>, password?: string) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  changeUserStatus: (id: string, status: any) => Promise<void>;
  changePassword: (id: string, passwordData: PasswordChangeRequest) => Promise<void>;
  selectUser: (user: User | null) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setPagination: (pagination: Partial<UserPagination>) => void;
  importUsers: (usersData: UserImportData[]) => Promise<User[]>;
  exportUsers: () => Promise<string>;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [filters, setFiltersState] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'fechaRegistro',
    sortOrder: 'desc'
  });

  const [pagination, setPaginationState] = useState<UserPagination>({
    page: 1,
    limit: 10,
    total: 0
  });

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      setPaginationState(prev => ({ ...prev, total: allUsers.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'fechaRegistro' | 'historialActividad'>, password?: string): Promise<User> => {
    console.log('UserContext: createUser called with:', userData, 'password provided:', !!password);
    
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.role !== 'admin') {
        throw new Error('No tienes permisos para crear usuarios');
      }

      console.log('UserContext: Calling userService.createUser');
      const newUser = password 
        ? await userService.createUserWithPassword(userData, password)
        : await userService.createUser(userData);
      console.log('UserContext: User created successfully:', newUser);
      
      setUsers(prev => [newUser, ...prev]);
      setPaginationState(prev => ({ ...prev, total: prev.total + 1 }));
      
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando usuario';
      console.error('UserContext: Error creating user:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.role !== 'admin' && currentUser?.id !== id) {
        throw new Error('No tienes permisos para editar este usuario');
      }

      const updatedUser = await userService.updateUser(id, updates);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }

      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.role !== 'admin') {
        throw new Error('No tienes permisos para eliminar usuarios');
      }

      if (currentUser?.id === id) {
        throw new Error('No puedes eliminar tu propia cuenta');
      }

      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      setPaginationState(prev => ({ ...prev, total: prev.total - 1 }));
      
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changeUserStatus = async (id: string, status: any): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.role !== 'admin') {
        throw new Error('No tienes permisos para cambiar el estado de usuarios');
      }

      if (currentUser?.id === id) {
        throw new Error('No puedes cambiar tu propio estado');
      }

      const updatedUser = await userService.changeUserStatus(id, status);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cambiando estado del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (id: string, passwordData: PasswordChangeRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.id !== id && currentUser?.role !== 'admin') {
        throw new Error('No tienes permisos para cambiar esta contraseña');
      }

      await userService.changePassword(id, passwordData.currentPassword, passwordData.newPassword);
      
      // Add activity log
      await userService.addActivityLog(id, {
        accion: 'Contraseña cambiada',
        modulo: 'security',
        detalles: 'El usuario cambió su contraseña'
      });

      // Reload user to get updated activity
      const updatedUser = await userService.getUserById(id);
      if (updatedUser) {
        setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
        if (selectedUser?.id === id) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cambiando contraseña';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const importUsers = async (usersData: UserImportData[]): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.role !== 'admin') {
        throw new Error('No tienes permisos para importar usuarios');
      }

      const importedUsers = await userService.importUsers(usersData);
      setUsers(prev => [...importedUsers, ...prev]);
      setPaginationState(prev => ({ ...prev, total: prev.total + importedUsers.length }));
      
      return importedUsers;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error importando usuarios';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async (): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Check permissions
      if (currentUser?.role !== 'admin') {
        throw new Error('No tienes permisos para exportar usuarios');
      }

      return await userService.exportUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando usuarios';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user: User | null) => {
    setSelectedUser(user);
  };

  const setFilters = (newFilters: Partial<UserFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const setPagination = (newPagination: Partial<UserPagination>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }));
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <UserContext.Provider value={{
      users,
      loading,
      error,
      filters,
      pagination,
      selectedUser,
      loadUsers,
      createUser,
      updateUser,
      deleteUser,
      changeUserStatus,
      changePassword,
      selectUser,
      setFilters,
      setPagination,
      importUsers,
      exportUsers,
      clearError
    }}>
      {children}
    </UserContext.Provider>
  );
};