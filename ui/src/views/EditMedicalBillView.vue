<template>
  <div class="edit-medical-bill-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Edit Medical Bill</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading medical bill...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/medical-bills" class="btn btn-secondary mt-4">
            Back to Bills
          </router-link>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
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
            <button type="submit" :disabled="saving" class="btn btn-primary">
              <span v-if="saving" class="spinner spinner-sm mr-2"></span>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/services/api'

const router = useRouter()
const route = useRoute()

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
const saving = ref(false)
const error = ref('')

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

const loadBill = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get(`/api/medical-bills/${route.params.id}`)
    const bill = response.data.data

    form.medicalProviderId = bill.medicalProviderId
    form.dateOfService = bill.dateOfService.split('T')[0] // Convert to YYYY-MM-DD format
    form.total = bill.total
    form.serviceEventIds = bill.serviceEvents?.map((event: any) => event.id) || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load medical bill'
  } finally {
    loading.value = false
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

  saving.value = true

  try {
    const billId = route.params.id as string
    const data = {
      medicalProviderId: form.medicalProviderId,
      dateOfService: form.dateOfService,
      total: form.total,
    }

    await apiClient.put(`/api/medical-bills/${billId}`, data)

    // Get current associations
    const currentBill = await apiClient.get(`/api/medical-bills/${billId}`)
    const currentServiceEventIds = currentBill.data.data.serviceEvents?.map((event: any) => event.id) || []

    // Remove associations that are no longer selected
    const toRemove = currentServiceEventIds.filter((id: string) => !form.serviceEventIds.includes(id))
    for (const serviceEventId of toRemove) {
      await apiClient.delete(`/api/medical-bills/${billId}/service-events/${serviceEventId}`)
    }

    // Add new associations
    const toAdd = form.serviceEventIds.filter(id => !currentServiceEventIds.includes(id))
    if (toAdd.length > 0) {
      await apiClient.post(`/api/medical-bills/${billId}/service-events`, {
        serviceEventIds: toAdd,
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
      alert('Failed to update medical bill: ' + (err.message || 'Unknown error'))
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProviders()
  loadServiceEvents()
  loadBill()
})
</script>