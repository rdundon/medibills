<template>
  <div class="providers-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Medical Providers</h2>
          <router-link to="/providers/create" class="btn btn-primary">
            Add Provider
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading providers...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadProviders" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="providers.length === 0" class="text-center py-8">
          <p class="text-gray-600">No medical providers found.</p>
          <router-link to="/providers/create" class="btn btn-primary mt-4">
            Add Your First Provider
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Website</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="provider in providers" :key="provider.id">
                  <td>
                    <div>
                      <div class="font-medium">{{ provider.name }}</div>
                      <div v-if="provider.address" class="text-sm text-gray-600">
                        {{ provider.address }}
                      </div>
                    </div>
                  </td>
                  <td>{{ provider.phone || '-' }}</td>
                  <td>
                    <a v-if="provider.website" :href="provider.website" target="_blank" class="text-blue-600 hover:underline">
                      {{ provider.website }}
                    </a>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/providers/${provider.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deleteProvider(provider.id)" class="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/services/api'

interface MedicalProvider {
  id: string
  name: string
  address?: string
  phone?: string
  website?: string
  paymentWebsite?: string
  createdAt: string
  updatedAt: string
}

const providers = ref<MedicalProvider[]>([])
const loading = ref(false)
const error = ref('')

const loadProviders = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get('/api/medical-providers')
    providers.value = response.data.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load providers'
  } finally {
    loading.value = false
  }
}

const deleteProvider = async (id: string) => {
  if (!confirm('Are you sure you want to delete this provider?')) {
    return
  }

  try {
    await apiClient.delete(`/api/medical-providers/${id}`)
    await loadProviders() // Reload the list
  } catch (err: any) {
    alert('Failed to delete provider: ' + (err.message || 'Unknown error'))
  }
}

onMounted(() => {
  loadProviders()
})
</script>