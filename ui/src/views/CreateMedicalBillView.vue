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

const providers = ref<MedicalProvider[]>([])
const form = reactive({
  medicalProviderId: '',
  dateOfService: '',
  total: 0,
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

    await apiClient.post('/api/medical-bills', data)
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
})
</script>