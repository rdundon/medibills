<template>
  <div class="create-collection-bill-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Add Collection Bill</h2>
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
            <label for="dateOfNotice" class="form-label">Date of Notice *</label>
            <input
              id="dateOfNotice"
              v-model="form.dateOfNotice"
              type="date"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.dateOfNotice }"
            />
            <p v-if="errors.dateOfNotice" class="form-error">{{ errors.dateOfNotice }}</p>
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
            <label for="amountTotal" class="form-label">Amount Total *</label>
            <input
              id="amountTotal"
              v-model.number="form.amountTotal"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.amountTotal }"
            />
            <p v-if="errors.amountTotal" class="form-error">{{ errors.amountTotal }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/collection-bills" class="btn btn-secondary">
              Cancel
            </router-link>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="spinner spinner-sm mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Collection Bill' }}
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
  dateOfNotice: '',
  dateOfService: '',
  amountTotal: 0,
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)

const loadProviders = async () => {
  try {
    const response = await apiClient.get('/api/medical-providers')
    providers.value = response.data.data
  } catch (err: any) {
    alert('Failed to load providers: ' + (err.message || 'Unknown error'))
  }
}

const validateForm = () => {
  errors.medicalProviderId = ''
  errors.dateOfNotice = ''
  errors.dateOfService = ''
  errors.amountTotal = ''

  let isValid = true

  if (!form.medicalProviderId) {
    errors.medicalProviderId = 'Medical provider is required'
    isValid = false
  }

  if (!form.dateOfNotice) {
    errors.dateOfNotice = 'Date of notice is required'
    isValid = false
  }

  if (!form.dateOfService) {
    errors.dateOfService = 'Date of service is required'
    isValid = false
  }

  if (form.amountTotal <= 0) {
    errors.amountTotal = 'Amount total must be greater than 0'
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
      dateOfNotice: form.dateOfNotice,
      dateOfService: form.dateOfService,
      amountTotal: form.amountTotal,
    }

    await apiClient.post('/api/collection-bills', data)
    router.push('/collection-bills')
  } catch (err: any) {
    if (err.response?.data?.details) {
      // Handle validation errors from server
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to create collection bill: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProviders()
})
</script>