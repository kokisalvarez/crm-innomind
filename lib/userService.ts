import type {
  User,
  UserImportData,
  UserRole,
  UserStatus,
  ActivityLog
} from '../src/types/user';
import { authService } from './authService';

class UserService {
  private users: User[] = [];
  private initialized = false;

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    if (this.initialized) return;
    
    const savedUsers = localStorage.getItem('crm-users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        this.users = parsed.map((user: any) => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          fechaActualizacion: user.fechaActualizacion ? new Date(user.fechaActualizacion) : undefined,
          ultimoAcceso: user.ultimoAcceso ? new Date(user.ultimoAcceso) : undefined,
          historialActividad: user.historialActividad.map((activity: any) => ({
            ...activity,
            fecha: new Date(activity.fecha)
          }))
        }));
      } catch (error) {
        console.error('Error loading users:', error);
        this.users = this.getDefaultUsers();
      }
    } else {
      this.users = this.getDefaultUsers();
    }
    
    this.initialized = true;
    this.saveUsers();
  }

  private saveUsers(): void {
    localStorage.setItem('crm-users', JSON.stringify(this.users));
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: '1',
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@techsolutions.com',
        telefono: '+52 55 1234 5678',
        rol: 'admin',
        estado: 'active',
        departamento: 'Administración',
        cargo: 'Administrador del Sistema',
        fechaRegistro: new Date('2024-01-01'),
        ultimoAcceso: new Date(),
        permisos: [
          { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
          { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'delete', 'approve'] },
          { modulo: 'products', acciones: ['view', 'create', 'edit', 'delete'] },
          { modulo: 'users', acciones: ['view', 'create', 'edit', 'delete', 'invite'] },
          { modulo: 'reports', acciones: ['view', 'export'] },
          { modulo: 'settings', acciones: ['view', 'edit'] }
        ],
        configuracion: {
          idioma: 'es',
          timezone: 'America/Mexico_City',
          notificaciones: { email: true, push: true, sms: false },
          tema: 'light'
        },
        estadisticas: {
          prospectosManagedos: 25,
          cotizacionesCreadas: 15,
          ventasCerradas: 8,
          tasaConversion: 32.0,
          tiempoPromedioRespuesta: 2.5
        },
        historialActividad: [
          {
            id: '1',
            fecha: new Date(),
            accion: 'Inicio de sesión',
            modulo: 'auth',
            detalles: 'Usuario inició sesión en el sistema',
            ip: '192.168.1.100'
          }
        ]
      },
      {
        id: '2',
        nombre: 'Usuario',
        apellido: 'Demo',
        email: 'usuario@techsolutions.com',
        telefono: '+52 55 8765 4321',
        rol: 'agent',
        estado: 'active',
        departamento: 'Ventas',
        cargo: 'Ejecutivo de Ventas',
        fechaRegistro: new Date('2024-01-15'),
        ultimoAcceso: new Date(Date.now() - 86400000), // 1 day ago
        permisos: [
          { modulo: 'prospects', acciones: ['view', 'create', 'edit'] },
          { modulo: 'quotes', acciones: ['view', 'create', 'edit'] },
          { modulo: 'products', acciones: ['view'] },
          { modulo: 'reports', acciones: ['view'] }
        ],
        configuracion: {
          idioma: 'es',
          timezone: 'America/Mexico_City',
          notificaciones: { email: true, push: true, sms: false },
          tema: 'light'
        },
        estadisticas: {
          prospectosManagedos: 12,
          cotizacionesCreadas: 8,
          ventasCerradas: 3,
          tasaConversion: 25.0,
          tiempoPromedioRespuesta: 3.2
        },
        historialActividad: [
          {
            id: '1',
            fecha: new Date(Date.now() - 86400000),
            accion: 'Creó prospecto',
            modulo: 'prospects',
            detalles: 'Creó nuevo prospecto: María García',
            ip: '192.168.1.101'
          }
        ]
      }
    ];
  }

  async getAllUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(user => user.id === id) || null;
  }

  // Add default auth user creation for users created without password
  async createUser(userData: Omit<User, 'id' | 'fechaRegistro' | 'historialActividad'>): Promise<User> {
    console.log('UserService: createUser called with:', userData);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate email uniqueness
    if (this.users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Ya existe un usuario con este correo electrónico');
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      fechaRegistro: new Date(),
      historialActividad: [{
        id: '1',
        fecha: new Date(),
        accion: 'Usuario creado',
        modulo: 'users',
        detalles: 'Usuario creado en el sistema'
      }]
    };

    console.log('UserService: Creating new user:', newUser);

    this.users.unshift(newUser);
    this.saveUsers();

    // Add to auth service for login capability with default password
    const defaultPassword = 'temp123';
    try {
      console.log('UserService: Adding user to auth service with default password');
      await authService.addUser({
        id: newUser.id,
        email: newUser.email,
        password: defaultPassword,
        name: `${newUser.nombre} ${newUser.apellido}`,
        role: newUser.rol === 'admin' ? 'admin' : 'user'
      });
      
      console.log(`UserService: Usuario creado exitosamente: ${newUser.email} con contraseña: ${defaultPassword}`);
    } catch (error) {
      console.error('UserService: Error adding user to auth service:', error);
      // Remove user from users array if auth creation fails
      this.users = this.users.filter(u => u.id !== newUser.id);
      this.saveUsers();
      throw new Error('Error al crear las credenciales de acceso del usuario');
    }

    console.log('UserService: User created successfully:', newUser);
    return newUser;
  }

  async createUserWithPassword(userData: Omit<User, 'id' | 'fechaRegistro' | 'historialActividad'>, password: string): Promise<User> {
    console.log('UserService: createUserWithPassword called with:', userData, 'password provided:', !!password);
    
    // Create the user first
    const newUser = await this.createUser(userData);
    
    // Add to auth service for login capability with custom password
    const userPassword = password || 'temp123'; // Use provided password or default
    try {
      console.log('UserService: Adding user to auth service with custom password');
      await authService.addUser({
        id: newUser.id,
        email: newUser.email,
        password: userPassword,
        name: `${newUser.nombre} ${newUser.apellido}`,
        role: newUser.rol === 'admin' ? 'admin' : 'user'
      });
      
      console.log(`UserService: Usuario creado exitosamente: ${newUser.email} con contraseña: ${userPassword}`);
    } catch (error) {
      console.error('UserService: Error adding user to auth service:', error);
      // Remove user from users array if auth creation fails
      this.users = this.users.filter(u => u.id !== newUser.id);
      this.saveUsers();
      throw new Error('Error al crear las credenciales de acceso del usuario');
    }

    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    console.log('UserService: updateUser called with:', { id, updates });
    
    await new Promise(resolve => setTimeout(resolve, 400));

    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Validate email uniqueness if email is being updated
    if (updates.email && updates.email !== this.users[userIndex].email) {
      if (this.users.some(user => user.email.toLowerCase() === updates.email!.toLowerCase() && user.id !== id)) {
        throw new Error('Ya existe un usuario con este correo electrónico');
      }
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updates,
      fechaActualizacion: new Date()
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    // Update in auth service
    if (updates.email || updates.nombre || updates.apellido || updates.rol) {
      try {
        await authService.updateUser(id, {
          email: updatedUser.email,
          name: `${updatedUser.nombre} ${updatedUser.apellido}`,
          role: updatedUser.rol === 'admin' ? 'admin' : 'user'
        });
      } catch (error) {
        console.error('Error updating user in auth service:', error);
      }
    }

    console.log('UserService: User updated successfully:', updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Don't allow deleting the last admin
    const user = this.users[userIndex];
    if (user.rol === 'admin') {
      const adminCount = this.users.filter(u => u.rol === 'admin' && u.id !== id).length;
      if (adminCount === 0) {
        throw new Error('No se puede eliminar el último administrador del sistema');
      }
    }

    this.users.splice(userIndex, 1);
    this.saveUsers();

    // Remove from auth service
    try {
      await authService.removeUser(id);
    } catch (error) {
      console.error('Error removing user from auth service:', error);
    }
  }

  async changeUserStatus(id: string, status: UserStatus): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = await this.updateUser(id, { estado: status });
    
    // Add activity log
    this.addActivityLog(id, {
      accion: `Estado cambiado a ${status}`,
      modulo: 'users',
      detalles: `El estado del usuario fue cambiado a ${status}`
    });

    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    // In a real app, you would verify the current password
    // For demo purposes, we'll just update it
    
    try {
      await authService.changePassword(id, newPassword);
      
      this.addActivityLog(id, {
        accion: 'Contraseña cambiada',
        modulo: 'security',
        detalles: 'El usuario cambió su contraseña'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Error al cambiar la contraseña');
    }
  }

  async addActivityLog(userId: string, activity: Omit<ActivityLog, 'id' | 'fecha'>): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return;

    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      fecha: new Date()
    };

    this.users[userIndex].historialActividad.unshift(newActivity);
    this.saveUsers();
  }

  async importUsers(usersData: UserImportData[]): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const createdUsers: User[] = [];
    const errors: string[] = [];

    for (const userData of usersData) {
      try {
        // Check for duplicate emails
        if (this.users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
          errors.push(`Email duplicado: ${userData.email}`);
          continue;
        }

        const newUser = await this.createUser({
          ...userData,
          estado: 'pending',
          permisos: this.getDefaultPermissions(userData.rol),
          configuracion: {
            idioma: 'es',
            timezone: 'America/Mexico_City',
            notificaciones: { email: true, push: true, sms: false },
            tema: 'light'
          },
          estadisticas: {
            prospectosManagedos: 0,
            cotizacionesCreadas: 0,
            ventasCerradas: 0,
            tasaConversion: 0,
            tiempoPromedioRespuesta: 0
          }
        });

        createdUsers.push(newUser);
      } catch (error) {
        errors.push(`Error creando usuario ${userData.email}: ${error}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Errores durante la importación:', errors);
    }

    return createdUsers;
  }

  async exportUsers(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const csvHeaders = [
      'nombre', 'apellido', 'email', 'telefono', 'rol', 'estado', 
      'departamento', 'cargo', 'fechaRegistro', 'ultimoAcceso',
      'prospectosManagedos', 'cotizacionesCreadas', 'ventasCerradas'
    ];

    const csvData = [
      csvHeaders.join(','),
      ...this.users.map(user => [
        user.nombre,
        user.apellido,
        user.email,
        user.telefono || '',
        user.rol,
        user.estado,
        user.departamento || '',
        user.cargo || '',
        user.fechaRegistro.toISOString().split('T')[0],
        user.ultimoAcceso ? user.ultimoAcceso.toISOString().split('T')[0] : '',
        user.estadisticas.prospectosManagedos,
        user.estadisticas.cotizacionesCreadas,
        user.estadisticas.ventasCerradas
      ].join(','))
    ].join('\n');

    return csvData;
  }

  private getDefaultPermissions(role: UserRole) {
    const permissions = {
      admin: [
        { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
        { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'delete', 'approve'] },
        { modulo: 'products', acciones: ['view', 'create', 'edit', 'delete'] },
        { modulo: 'users', acciones: ['view', 'create', 'edit', 'delete', 'invite'] },
        { modulo: 'reports', acciones: ['view', 'export'] },
        { modulo: 'settings', acciones: ['view', 'edit'] }
      ],
      manager: [
        { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
        { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'approve'] },
        { modulo: 'products', acciones: ['view', 'create', 'edit'] },
        { modulo: 'users', acciones: ['view', 'invite'] },
        { modulo: 'reports', acciones: ['view', 'export'] },
        { modulo: 'settings', acciones: ['view'] }
      ],
      agent: [
        { modulo: 'prospects', acciones: ['view', 'create', 'edit'] },
        { modulo: 'quotes', acciones: ['view', 'create', 'edit'] },
        { modulo: 'products', acciones: ['view'] },
        { modulo: 'reports', acciones: ['view'] }
      ],
      viewer: [
        { modulo: 'prospects', acciones: ['view'] },
        { modulo: 'quotes', acciones: ['view'] },
        { modulo: 'products', acciones: ['view'] },
        { modulo: 'reports', acciones: ['view'] }
      ]
    };

    return permissions[role] || permissions.viewer;
  }

  async getUserProspects(userId: string): Promise<any[]> {
    // This would integrate with the CRM context to get prospects assigned to this user
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 200));
    return [];
  }

  async assignProspectToUser(prospectId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    this.addActivityLog(userId, {
      accion: 'Prospecto asignado',
      modulo: 'prospects',
      detalles: `Se asignó el prospecto ${prospectId} al usuario`
    });
  }

  async updateLastAccess(userId: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].ultimoAcceso = new Date();
      this.saveUsers();
    }
  }

  // Method to set custom password for new users
  async setUserPassword(userId: string, password: string): Promise<void> {
    try {
      await authService.changePassword(userId, password);
      
      this.addActivityLog(userId, {
        accion: 'Contraseña establecida',
        modulo: 'security',
        detalles: 'Se estableció la contraseña inicial del usuario'
      });
    } catch (error) {
      console.error('Error setting user password:', error);
      throw new Error('Error al establecer la contraseña del usuario');
    }
  }

  // Debug method to check auth users
  async debugAuthUsers(): Promise<any[]> {
    return authService.getAllUsers();
  }
}

export const userService = new UserService();