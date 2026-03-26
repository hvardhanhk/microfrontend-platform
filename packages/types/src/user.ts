export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'customer' | 'guest';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
