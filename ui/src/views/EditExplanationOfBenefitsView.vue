<template>
  <div class="edit-explanation-of-benefits-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Edit Explanation of Benefits</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading explanation of benefits...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/explanation-of-benefits" class="btn btn-secondary mt-4">
            Back to EOBs
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
            <label for="totalBilled" class="form-label">Total Billed *</label>
            <input
              id="totalBilled"
              v-model.number="form.totalBilled"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.totalBilled }"
            />
            <p v-if="errors.totalBilled" class="form-error">{{ errors.totalBilled }}</p>
          </div>

          <div>
            <label for="totalPaid" class="form-label">Total Paid *</label>
            <input
              id="totalPaid"
              v-model.number="form.totalPaid"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.totalPaid }"
            />
            <p v-if="errors.totalPaid" class="form-error">{{ errors.totalPaid }}</p>
          </div>

          <div>
            <label for="totalDiscount" class="form-label">Total Discount</label>
            <input
              id="totalDiscount"
              v-model.number="form.totalDiscount"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              :class="{ 'border-red-500': errors.totalDiscount }"
            />
            <p v-if="errors.totalDiscount" class="form-error">{{ errors.totalDiscount }}</p>
          </div>

          <div>
            <label for="totalMayOwe" class="form-label">Total May Owe *</label>
            <input
              id="totalMayOwe"
              v-model.number="form.totalMayOwe"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.totalMayOwe }"
            />
            <p v-if="errors.totalMayOwe" class="form-error">{{ errors.totalMayOwe }}</p>
          </div>

          <div>
            <label for="insurer" class="form-label">Insurer *</label>
            <input
              id="insurer"
              v-model="form.insurer"
              type="text"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.insurer }"
            />
            <p v-if="errors.insurer" class="form-error">{{ errors.insurer }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/explanation-of-benefits" class="btn btn-secondary">
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

const providers = ref<MedicalProvider[]>([])
const form = reactive({
  medicalProviderId: '',
  dateOfService: '',
  totalBilled: 0,
  totalPaid: 0,
  totalDiscount: 0,
  totalMayOwe: 0,
  insurer: '',
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

const loadEOB = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get(`/api/explanation-of-benefits/${route.params.id}`)
    const eob = response.data.data

    form.medicalProviderId = eob.medicalProviderId
    form.dateOfService = eob.dateOfService.split('T')[0] // Convert to YYYY-MM-DD format
    form.totalBilled = eob.totalBilled
    form.totalPaid = eob.totalPaid
    form.totalDiscount = eob.totalDiscount
    form.totalMayOwe = eob.totalMayOwe
    form.insurer = eob.insurer
  } catch (err: any) {
    error.value = err.message || 'Failed to load explanation of benefits'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  if (!form.medicalProviderId) {
    errors.medicalProviderId = 'Medical provider is required'
    isValid = false
  }

  if (!form.dateOfService) {
    errors.dateOfService = 'Date of service is required'
    isValid = false
  }

  if (form.totalBilled <= 0) {
    errors.totalBilled = 'Total billed must be greater than 0'
    isValid = false
  }

  if (form.totalPaid < 0) {
    errors.totalPaid = 'Total paid must be 0 or greater'
    isValid = false
  }

  if (form.totalMayOwe < 0) {
    errors.totalMayOwe = 'Total may owe must be 0 or greater'
    isValid = false
  }

  if (!form.insurer.trim()) {
    errors.insurer = 'Insurer is required'
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
    const data = {
      medicalProviderId: form.medicalProviderId,
      dateOfService: form.dateOfService,
      totalBilled: form.totalBilled,
      totalPaid: form.totalPaid,
      totalDiscount: form.totalDiscount,
      totalMayOwe: form.totalMayOwe,
      insurer: form.insurer,
    }

    await apiClient.put(`/api/explanation-of-benefits/${route.params.id}`, data)
    router.push('/explanation-of-benefits')
  } catch (err: any) {
    if (err.response?.data?.details) {
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to update explanation of benefits: ' + (err.message || 'Unknown error'))
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProviders()
  loadEOB()
})
</script>