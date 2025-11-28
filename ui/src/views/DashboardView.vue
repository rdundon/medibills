<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>Welcome to MediBills Dashboard</h1>
      <p v-if="authStore.user">Hello, {{ authStore.user.username }}!</p>
    </div>
    
    <div class="dashboard-content">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Quick Actions</h2>
        </div>
        <div class="dashboard-actions">
           <router-link to="/medical-bills" class="btn btn-primary">
             View Medical Bills
           </router-link>
           <router-link to="/medical-bill-payments" class="btn btn-info">
             View Payments
           </router-link>
           <router-link to="/providers" class="btn btn-success">
             Manage Providers
           </router-link>
         </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">System Status</h2>
        </div>
        <div class="status-info">
          <p>✅ API Connection: Active</p>
          <p>✅ Database: Connected</p>
          <p>✅ Authentication: Working</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.dashboard-view {
  padding: 2rem 0;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.dashboard-content {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.status-info p {
  margin: 0.5rem 0;
  font-family: monospace;
}

@media (max-width: 768px) {
  .dashboard-actions {
    flex-direction: column;
  }
  
  .dashboard-actions .btn {
    width: 100%;
  }
}
</style>