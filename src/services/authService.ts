import { LoginCredentials, AuthResponse, User } from '../types/auth';

interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

// Simulamos una API de autenticación
class AuthService {
  private baseUrl = '/api/auth'; // En producción sería tu API real
  private users: MockUser[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const savedUsers = localStorage.getItem('auth-users');
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers);
      } catch (error) {
        console.error('Error loading auth users:', error);
        this.users = this.getDefaultUsers();
        this.saveUsers();
      }
    } else {
      this.users = this.getDefaultUsers();
      this.saveUsers();
    }
  }

  private saveUsers(): void {
    localStorage.setItem('auth-users', JSON.stringify(this.users));
  }

  private getDefaultUsers(): MockUser[] {
    return [
      {
        id: '1',
        email: 'admin@techsolutions.com',
        password: 'admin123',
        name: 'Administrador Sistema',
        role: 'admin'
      },
      {
        id: '2',
        email: 'usuario@techsolutions.com',
        password: 'user123',
        name: 'Usuario Demo',
        role: 'user'
      }
    ];
  }

  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar usuario en mock data
    const user = this.users.find(
      u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
    );

    if (!user) {
      console.log('Available users:', this.users.map(u => ({ email: u.email, password: u.password })));
      console.log('Attempted login:', credentials);
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }

    // Simular respuesta de API exitosa
    const authResponse: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || undefined
      },
      token: `mock_token_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.id}_${Date.now()}`
    };

    return authResponse;
  }

  async signOut(token: string): Promise<void> {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // En una API real, aquí invalidarías el token en el servidor
    console.log('Token invalidated on server:', token);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // En una API real, validarías el refresh token y generarías uno nuevo
    return {
      token: `refreshed_token_${Date.now()}`
    };
  }

  async getCurrentUser(token: string): Promise<User> {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    // En una API real, validarías el token y devolverías los datos del usuario
    const userId = token.split('_')[2];
    const user = this.users.find(u => u.id === userId);

    if (!user) {
      throw new Error('Token inválido');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || undefined
    };
  }

  // Método para agregar usuario (usado por el sistema de gestión de usuarios)
  async addUser(userData: Omit<MockUser, 'id'>): Promise<MockUser> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      console.log('User already exists, updating:', userData.email);
      // Update existing user
      existingUser.name = userData.name;
      existingUser.role = userData.role;
      existingUser.password = userData.password;
      if (userData.avatar) existingUser.avatar = userData.avatar;
      this.saveUsers();
      return existingUser;
    }

    const newUser: MockUser = {
      ...userData,
      id: userData.id || Date.now().toString()
    };

    this.users.push(newUser);
    this.saveUsers();
    console.log('New auth user created:', newUser.email, 'password:', newUser.password);
    return newUser;
  }

  // Método para actualizar usuario
  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();
    return this.users[userIndex];
  }

  // Método para eliminar usuario
  async removeUser(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
    this.saveUsers();
  }

  // Método para cambiar contraseña
  async changePassword(id: string, newPassword: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex].password = newPassword;
      this.saveUsers();
      console.log('Password changed for user:', this.users[userIndex].email, 'new password:', newPassword);
    }
  }

  // Método para validar formato de email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Método para validar contraseña
  validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  // Método para obtener todos los usuarios (para debug)
  getAllUsers(): MockUser[] {
    return [...this.users];
  }
}

export const authService = new AuthService();