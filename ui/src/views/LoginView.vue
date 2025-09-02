<template>
  <div class="login-view">
    <div class="form-container">
      <h2>Login to MediBills</h2>
      
      <div v-if="authStore.error" class="alert alert-error">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username or Email</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :disabled="authStore.loading"
            placeholder="Enter your username or email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="authStore.loading"
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-full-width"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <div class="text-center mt-3">
        <p>Don't have an account? 
          <router-link to="/register">Register here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

onMounted(() => {
  authStore.clearError()
})

const handleLogin = async () => {
  try {
    await authStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch (error) {
    // Error is handled by the store
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-container h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.form-container a {
  color: #3498db;
  text-decoration: none;
}

.form-container a:hover {
  text-decoration: underline;
}
</style>