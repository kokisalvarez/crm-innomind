import React, { useState } from 'react';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import UserDetail from './UserDetail';
import UserForm from './UserForm';
import UserImportExport from './UserImportExport';
import { User, UserImportData } from '../../types/user';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, createUser, updateUser, importUsers, exportUsers } = useUsers();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleUserEdit = (userId: string) => {
    setEditingUserId(userId);
    setShowUserForm(true);
    setIsInvitation(false);
  };

  const handleUserCreate = () => {
    setEditingUserId(null);
    setIsInvitation(false);
    setShowUserForm(true);
  };

  const handleInviteUser = () => {
    setEditingUserId(null);
    setIsInvitation(true);
    setShowUserForm(true);
  };

  const handleUserSave = async (userData: Partial<User>, password?: string) => {
    console.log('UserManagement: handleUserSave called with:', { userData, password });
    
    try {
      if (editingUserId) {
        console.log('Updating existing user:', editingUserId);
        // Update existing user
        await updateUser(editingUserId, userData);
      } else {
        console.log('Creating new user');
        // Create new user with custom password if provided
        const newUserData = {
          ...userData,
          estado: isInvitation ? 'pending' : 'active',
          permisos: userData.permisos || [],
          configuracion: userData.configuracion || {
            idioma: 'es',
            timezone: 'America/Mexico_City',
            notificaciones: { email: true, push: true, sms: false },
            tema: 'light'
          },
          estadisticas: userData.estadisticas || {
            prospectosManagedos: 0,
            cotizacionesCreadas: 0,
            ventasCerradas: 0,
            tasaConversion: 0,
            tiempoPromedioRespuesta: 0
          }
        } as Omit<User, 'id' | 'fechaRegistro' | 'historialActividad'>;

        console.log('Calling createUser with:', newUserData);
        const createdUser = await createUser(newUserData, password);
        console.log('User created successfully:', createdUser);
        
      }
      
      console.log('User save completed successfully');
      setShowUserForm(false);
      setEditingUserId(null);
      setIsInvitation(false);
    } catch (error) {
      console.error('Error in handleUserSave:', error);
      // Don't close the form on error, let the user see the error and try again
      throw error; // Re-throw to let the form handle the error display
    }
  };

  const handleImportUsers = async (usersData: UserImportData[]) => {
    try {
      const importedUsers = await importUsers(usersData);
      console.log('Users imported successfully:', importedUsers);
      setShowImportExport(false);
      return importedUsers;
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  };

  const handleExportUsers = async () => {
    try {
      const csvData = await exportUsers();
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return csvData;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  };

  // Show user detail
  if (selectedUserId) {
    return (
      <UserDetail
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onEdit={() => handleUserEdit(selectedUserId)}
      />
    );
  }

  return (
    <>
      <UserList
        onUserSelect={handleUserSelect}
        onUserEdit={handleUserEdit}
        onUserCreate={handleUserCreate}
        onImportExport={() => setShowImportExport(true)}
      />

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUserId ? users.find(u => u.id === editingUserId) : null}
          onClose={() => {
            setShowUserForm(false);
            setEditingUserId(null);
            setIsInvitation(false);
          }}
          onSave={handleUserSave}
          isInvitation={isInvitation}
        />
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <UserImportExport
          onImport={handleImportUsers}
          onExport={handleExportUsers}
          onClose={() => setShowImportExport(false)}
        />
      )}
    </>
  );
};

export default UserManagement;