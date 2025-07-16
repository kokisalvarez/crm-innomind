// project/lib/authService.ts

import type { LoginCredentials, AuthResponse, User } from '../src/types/auth';

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
    const saved = localStorage.getItem('auth-users');
    if (saved) {
      try {
        this.users = JSON.parse(saved);
      } catch {
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
    await new Promise(r => setTimeout(r, 1000));

    const user = this.users.find(
      u =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (!user) {
      console.log('Available users:', this.users);
      console.log('Attempted login:', credentials);
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }

    return {
      user: {
        id:     user.id,
        email:  user.email,
        name:   user.name,
        role:   user.role,
        avatar: user.avatar
      },
      token:        `mock_token_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.id}_${Date.now()}`
    };
  }

  async signOut(token: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
    console.log('Token invalidated on server:', token);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    await new Promise(r => setTimeout(r, 500));
    return { token: `refreshed_token_${Date.now()}` };
  }

  async getCurrentUser(token: string): Promise<User> {
    await new Promise(r => setTimeout(r, 300));
    const userId = token.split('_')[2];
    const user   = this.users.find(u => u.id === userId);
    if (!user) throw new Error('Token inválido');
    return {
      id:     user.id,
      email:  user.email,
      name:   user.name,
      role:   user.role,
      avatar: user.avatar
    };
  }

  async addUser(userData: Omit<MockUser, 'id'>): Promise<MockUser> {
    const existing = this.users.find(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existing) {
      existing.name     = userData.name;
      existing.role     = userData.role;
      existing.password = userData.password;
      existing.avatar   = userData.avatar;
      this.saveUsers();
      return existing;
    }

    const newUser: MockUser = {
      ...userData,
      id: Date.now().toString()
    };
    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    this.users[idx] = { ...this.users[idx], ...updates };
    this.saveUsers();
    return this.users[idx];
  }

  async removeUser(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
    this.saveUsers();
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx].password = newPassword;
      this.saveUsers();
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  getAllUsers(): MockUser[] {
    return [...this.users];
  }
}

export const authService = new AuthService();
