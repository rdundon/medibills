<template>
  <div class="collection-bills-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Collection Bills</h2>
          <router-link to="/collection-bills/create" class="btn btn-primary">
            Add Collection Bill
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading collection bills...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadCollectionBills" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="collectionBills.length === 0" class="text-center py-8">
          <p class="text-gray-600">No collection bills found.</p>
          <router-link to="/collection-bills/create" class="btn btn-primary mt-4">
            Add Your First Collection Bill
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Date of Notice</th>
                  <th>Date of Service</th>
                  <th>Amount Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bill in collectionBills" :key="bill.id">
                  <td>
                    <div class="font-medium">{{ bill.medicalProvider?.name || 'Unknown' }}</div>
                  </td>
                  <td>{{ formatDate(bill.dateOfNotice) }}</td>
                  <td>{{ formatDate(bill.dateOfService) }}</td>
                  <td>${{ bill.amountTotal.toFixed(2) }}</td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/collection-bills/${bill.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deleteCollectionBill(bill.id)" class="btn btn-sm btn-danger">
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

interface CollectionBill {
  id: string
  medicalProviderId: string
  medicalProvider?: MedicalProvider
  dateOfNotice: string
  dateOfService: string
  amountTotal: number
  createdAt: string
  updatedAt: string
}

const collectionBills = ref<CollectionBill[]>([])
const loading = ref(false)
const error = ref('')

const loadCollectionBills = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get('/api/collection-bills')
    collectionBills.value = response.data.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load collection bills'
  } finally {
    loading.value = false
  }
}

const deleteCollectionBill = async (id: string) => {
  if (!confirm('Are you sure you want to delete this collection bill?')) {
    return
  }

  try {
    await apiClient.delete(`/api/collection-bills/${id}`)
    await loadCollectionBills() // Reload the list
  } catch (err: any) {
    alert('Failed to delete collection bill: ' + (err.message || 'Unknown error'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadCollectionBills()
})
</script>