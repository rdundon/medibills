<template>
  <div class="medical-bills-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Medical Bills</h2>
          <router-link to="/medical-bills/create" class="btn btn-primary">
            Add Bill
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading medical bills...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadBills" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="bills.length === 0" class="text-center py-8">
          <p class="text-gray-600">No medical bills found.</p>
          <router-link to="/medical-bills/create" class="btn btn-primary mt-4">
            Add Your First Bill
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Provider</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bill in bills" :key="bill.id">
                  <td>{{ formatDate(bill.dateOfService) }}</td>
                  <td>
                    <div>
                      <div class="font-medium">{{ bill.medicalProvider?.name }}</div>
                      <div v-if="bill.medicalProvider?.phone" class="text-sm text-gray-600">
                        {{ bill.medicalProvider.phone }}
                      </div>
                    </div>
                  </td>
                  <td class="font-medium">${{ bill.total.toFixed(2) }}</td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/medical-bills/${bill.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deleteBill(bill.id)" class="btn btn-sm btn-danger">
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

interface MedicalBill {
  id: string
  medicalProviderId: string
  dateOfService: string
  total: number
  createdAt: string
  updatedAt: string
  medicalProvider?: MedicalProvider
}

const bills = ref<MedicalBill[]>([])
const loading = ref(false)
const error = ref('')

const loadBills = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get('/api/medical-bills')
    bills.value = response.data.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load medical bills'
  } finally {
    loading.value = false
  }
}

const deleteBill = async (id: string) => {
  if (!confirm('Are you sure you want to delete this medical bill?')) {
    return
  }

  try {
    await apiClient.delete(`/api/medical-bills/${id}`)
    await loadBills() // Reload the list
  } catch (err: any) {
    alert('Failed to delete medical bill: ' + (err.message || 'Unknown error'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadBills()
})
</script>