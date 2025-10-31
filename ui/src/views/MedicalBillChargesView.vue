<template>
  <div class="medical-bill-charges-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Medical Bill Charges</h2>
          <router-link to="/medical-bill-charges/create" class="btn btn-primary">
            Add Charge
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading charges...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadCharges" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="charges.length === 0" class="text-center py-8">
          <p class="text-gray-600">No medical bill charges found.</p>
          <router-link to="/medical-bill-charges/create" class="btn btn-primary mt-4">
            Add Your First Charge
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Medical Bill</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="charge in charges" :key="charge.id">
                  <td>
                    <div>
                      <div class="font-medium">
                        {{ charge.medicalBill?.medicalProvider?.name }}
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ formatDate(charge.medicalBill?.dateOfService || '') }}
                      </div>
                    </div>
                  </td>
                  <td class="font-medium">${{ charge.amount.toFixed(2) }}</td>
                  <td>{{ charge.description || '-' }}</td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/medical-bill-charges/${charge.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deleteCharge(charge.id)" class="btn btn-sm btn-danger">
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
}

interface MedicalBill {
  id: string
  dateOfService: string
  medicalProvider?: MedicalProvider
}

interface MedicalBillCharge {
  id: string
  medicalBillId: string
  amount: number
  description?: string
  createdAt: string
  updatedAt: string
  medicalBill?: MedicalBill
}

const charges = ref<MedicalBillCharge[]>([])
const loading = ref(false)
const error = ref('')

const loadCharges = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get('/api/medical-bill-charges')
    charges.value = response.data.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load medical bill charges'
  } finally {
    loading.value = false
  }
}

const deleteCharge = async (id: string) => {
  if (!confirm('Are you sure you want to delete this charge?')) {
    return
  }

  try {
    await apiClient.delete(`/api/medical-bill-charges/${id}`)
    await loadCharges() // Reload the list
  } catch (err: any) {
    alert('Failed to delete charge: ' + (err.message || 'Unknown error'))
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadCharges()
})
</script>