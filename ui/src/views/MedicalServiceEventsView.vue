<template>
  <div class="medical-service-events-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Medical Service Events</h2>
          <router-link to="/medical-service-events/create" class="btn btn-primary">
            Add Service Event
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading service events...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadMedicalServiceEvents" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="medicalServiceEvents.length === 0" class="text-center py-8">
          <p class="text-gray-600">No medical service events found.</p>
          <router-link to="/medical-service-events/create" class="btn btn-primary mt-4">
            Add Your First Service Event
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Date of Service</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in medicalServiceEvents" :key="event.id">
                  <td>
                    <div class="font-medium">{{ event.medicalProvider?.name || 'Unknown' }}</div>
                  </td>
                  <td>{{ formatDate(event.dateOfService) }}</td>
                  <td>{{ event.description || '-' }}</td>
                  <td>{{ event.amount ? '$' + event.amount.toFixed(2) : '-' }}</td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/medical-service-events/${event.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deleteMedicalServiceEvent(event.id)" class="btn btn-sm btn-danger">
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
  total: number
}

interface ExplanationOfBenefits {
  id: string
  dateOfService: string
  totalBilled: number
}

interface MedicalServiceEvent {
  id: string
  medicalProviderId: string
  medicalProvider?: MedicalProvider
  medicalBillId?: string
  medicalBill?: MedicalBill
  explanationOfBenefitsId?: string
  explanationOfBenefits?: ExplanationOfBenefits
  dateOfService: string
  description?: string
  amount?: number
  createdAt: string
  updatedAt: string
}

const medicalServiceEvents = ref<MedicalServiceEvent[]>([])
const loading = ref(false)
const error = ref('')

const loadMedicalServiceEvents = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get('/api/medical-service-events')
    medicalServiceEvents.value = response.data.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load medical service events'
  } finally {
    loading.value = false
  }
}

const deleteMedicalServiceEvent = async (id: string) => {
  if (!confirm('Are you sure you want to delete this service event?')) {
    return
  }

  try {
    await apiClient.delete(`/api/medical-service-events/${id}`)
    await loadMedicalServiceEvents() // Reload the list
  } catch (err: any) {
    alert('Failed to delete service event: ' + (err.message || 'Unknown error'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadMedicalServiceEvents()
})
</script>