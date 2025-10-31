<template>
  <div class="explanation-of-benefits-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Explanation of Benefits</h2>
          <router-link to="/explanation-of-benefits/create" class="btn btn-primary">
            Add EOB
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading explanation of benefits...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadEOBs" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="eobs.length === 0" class="text-center py-8">
          <p class="text-gray-600">No explanation of benefits found.</p>
          <router-link to="/explanation-of-benefits/create" class="btn btn-primary mt-4">
            Add Your First EOB
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Provider</th>
                  <th>Total Billed</th>
                  <th>Total Paid</th>
                  <th>Insurer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eob in eobs" :key="eob.id">
                  <td>{{ formatDate(eob.dateOfService) }}</td>
                  <td>
                    <div>
                      <div class="font-medium">{{ eob.medicalProvider?.name }}</div>
                      <div v-if="eob.medicalProvider?.phone" class="text-sm text-gray-600">
                        {{ eob.medicalProvider.phone }}
                      </div>
                    </div>
                  </td>
                  <td class="font-medium">${{ eob.totalBilled.toFixed(2) }}</td>
                  <td class="font-medium">${{ eob.totalPaid.toFixed(2) }}</td>
                  <td>{{ eob.insurer }}</td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/explanation-of-benefits/${eob.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deleteEOB(eob.id)" class="btn btn-sm btn-danger">
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
  phone?: string
}

interface ExplanationOfBenefits {
  id: string
  medicalProviderId: string
  dateOfService: string
  totalPaid: number
  totalBilled: number
  totalDiscount: number
  totalMayOwe: number
  insurer: string
  createdAt: string
  updatedAt: string
  medicalProvider?: MedicalProvider
}

const eobs = ref<ExplanationOfBenefits[]>([])
const loading = ref(false)
const error = ref('')

const loadEOBs = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get('/api/explanation-of-benefits')
    eobs.value = response.data.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load explanation of benefits'
  } finally {
    loading.value = false
  }
}

const deleteEOB = async (id: string) => {
  if (!confirm('Are you sure you want to delete this explanation of benefits?')) {
    return
  }

  try {
    await apiClient.delete(`/api/explanation-of-benefits/${id}`)
    await loadEOBs() // Reload the list
  } catch (err: any) {
    alert('Failed to delete explanation of benefits: ' + (err.message || 'Unknown error'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadEOBs()
})
</script>