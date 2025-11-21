<template>
  <div class="create-medical-bill-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Add Medical Bill</h2>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label for="medicalProviderId" class="form-label">Medical Provider *</label>
            <select
              id="medicalProviderId"
              v-model="form.medicalProviderId"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.medicalProviderId }"
            >
              <option value="">Select a provider</option>
              <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                {{ provider.name }}
              </option>
            </select>
            <p v-if="errors.medicalProviderId" class="form-error">{{ errors.medicalProviderId }}</p>
          </div>

          <div>
            <label for="dateOfService" class="form-label">Date of Service *</label>
            <input
              id="dateOfService"
              v-model="form.dateOfService"
              type="date"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.dateOfService }"
            />
            <p v-if="errors.dateOfService" class="form-error">{{ errors.dateOfService }}</p>
          </div>

          <div>
            <label for="total" class="form-label">Total Amount *</label>
            <input
              id="total"
              v-model.number="form.total"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.total }"
            />
            <p v-if="errors.total" class="form-error">{{ errors.total }}</p>
          </div>

          <div>
            <label for="serviceEventIds" class="form-label">Associated Service Events</label>
            <select
              id="serviceEventIds"
              v-model="form.serviceEventIds"
              class="form-input"
              multiple
              :class="{ 'border-red-500': errors.serviceEventIds }"
            >
              <option v-for="event in serviceEvents" :key="event.id" :value="event.id">
                {{ formatDate(event.dateOfService) }} - {{ event.description || 'No description' }} (${{ event.amount || 0 }})
              </option>
            </select>
            <p class="text-sm text-gray-600 mt-1">Hold Ctrl/Cmd to select multiple service events</p>
            <p v-if="errors.serviceEventIds" class="form-error">{{ errors.serviceEventIds }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/medical-bills" class="btn btn-secondary">
              Cancel
            </router-link>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="spinner spinner-sm mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Bill' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/services/api'

const router = useRouter()

interface MedicalProvider {
  id: string
  name: string
}

interface MedicalServiceEvent {
  id: string
  dateOfService: string
  description?: string
  amount?: number
}

const providers = ref<MedicalProvider[]>([])
const serviceEvents = ref<MedicalServiceEvent[]>([])
const form = reactive({
  medicalProviderId: '',
  dateOfService: '',
  total: 0,
  serviceEventIds: [] as string[],
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)

const loadProviders = async () => {
  try {
    const response = await apiClient.get('/api/medical-providers')
    providers.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load providers:', err.message)
  }
}

const loadServiceEvents = async () => {
  try {
    const response = await apiClient.get('/api/medical-service-events')
    serviceEvents.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load service events:', err.message)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const validateForm = () => {
  errors.medicalProviderId = ''
  errors.dateOfService = ''
  errors.total = ''

  let isValid = true

  if (!form.medicalProviderId) {
    errors.medicalProviderId = 'Medical provider is required'
    isValid = false
  }

  if (!form.dateOfService) {
    errors.dateOfService = 'Date of service is required'
    isValid = false
  }

  if (form.total <= 0) {
    errors.total = 'Total must be greater than 0'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const data = {
      medicalProviderId: form.medicalProviderId,
      dateOfService: form.dateOfService,
      total: form.total,
    }

    const response = await apiClient.post('/api/medical-bills', data)
    const billId = response.data.data.id

    // Add service event associations if any
    if (form.serviceEventIds.length > 0) {
      await apiClient.post(`/api/medical-bills/${billId}/service-events`, {
        serviceEventIds: form.serviceEventIds,
      })
    }

    router.push('/medical-bills')
  } catch (err: any) {
    if (err.response?.data?.details) {
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to create medical bill: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProviders()
  loadServiceEvents()
})
</script>