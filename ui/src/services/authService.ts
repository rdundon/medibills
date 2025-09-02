import { apiClient } from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/login', credentials)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Login failed')
    }
    
    return response.data.data
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', credentials)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Registration failed')
    }
    
    return response.data.data
  },

  async logout(): Promise<void> {
    const response = await apiClient.post<ApiResponse>('/auth/logout')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Logout failed')
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get user information')
    }
    
    return response.data.data
  },

  async updateProfile(updates: { username?: string; email?: string }): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', updates)
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update profile')
    }
    
    return response.data.data
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.put<ApiResponse>('/auth/password', {
      currentPassword,
      newPassword
    })
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update password')
    }
  }
}