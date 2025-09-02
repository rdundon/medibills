import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)

  // Actions
  const login = async (username: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const userData = await authService.login({ username, password })
      user.value = userData
      return userData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (username: string, email: string, password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const userData = await authService.register({ username, email, password })
      user.value = userData
      return userData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    
    try {
      await authService.logout()
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
      // Clear user anyway on logout error
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const checkAuth = async () => {
    if (user.value) return // Already authenticated
    
    loading.value = true
    error.value = null
    
    try {
      const userData = await authService.getCurrentUser()
      user.value = userData
    } catch (err) {
      // Not authenticated, clear user
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: { username?: string; email?: string }) => {
    loading.value = true
    error.value = null
    
    try {
      const userData = await authService.updateProfile(updates)
      user.value = userData
      return userData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    clearError
  }
})