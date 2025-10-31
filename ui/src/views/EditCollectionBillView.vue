<template>
  <div class="edit-collection-bill-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Edit Collection Bill</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading collection bill...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/collection-bills" class="btn btn-secondary mt-4">
            Back to Collection Bills
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
  dateOfNotice: '',
  dateOfService: '',
  amountTotal: 0,
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
    alert('Failed to load providers: ' + (err.message || 'Unknown error'))
  }
}

const loadCollectionBill = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get(`/api/collection-bills/${route.params.id}`)
    const bill = response.data.data

    form.medicalProviderId = bill.medicalProviderId
    form.dateOfNotice = new Date(bill.dateOfNotice).toISOString().split('T')[0]
    form.dateOfService = new Date(bill.dateOfService).toISOString().split('T')[0]
    form.amountTotal = bill.amountTotal
  } catch (err: any) {
    error.value = err.message || 'Failed to load collection bill'
  } finally {
    loading.value = false
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

  saving.value = true

  try {
    const data = {
      medicalProviderId: form.medicalProviderId,
      dateOfNotice: form.dateOfNotice,
      dateOfService: form.dateOfService,
      amountTotal: form.amountTotal,
    }

    await apiClient.put(`/api/collection-bills/${route.params.id}`, data)
    router.push('/collection-bills')
  } catch (err: any) {
    if (err.response?.data?.details) {
      // Handle validation errors from server
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to update collection bill: ' + (err.message || 'Unknown error'))
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProviders()
  loadCollectionBill()
})
</script>