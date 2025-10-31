<template>
  <div class="edit-medical-service-event-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Edit Medical Service Event</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading service event...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/medical-service-events" class="btn btn-secondary mt-4">
            Back to Service Events
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
            <label for="medicalBillId" class="form-label">Medical Bill (Optional)</label>
            <select
              id="medicalBillId"
              v-model="form.medicalBillId"
              class="form-input"
              :class="{ 'border-red-500': errors.medicalBillId }"
            >
              <option value="">Select a medical bill</option>
              <option v-for="bill in medicalBills" :key="bill.id" :value="bill.id">
                {{ formatDate(bill.dateOfService) }} - ${{ bill.total.toFixed(2) }}
              </option>
            </select>
            <p v-if="errors.medicalBillId" class="form-error">{{ errors.medicalBillId }}</p>
          </div>

          <div>
            <label for="explanationOfBenefitsId" class="form-label">Explanation of Benefits (Optional)</label>
            <select
              id="explanationOfBenefitsId"
              v-model="form.explanationOfBenefitsId"
              class="form-input"
              :class="{ 'border-red-500': errors.explanationOfBenefitsId }"
            >
              <option value="">Select an explanation of benefits</option>
              <option v-for="eob in explanationOfBenefits" :key="eob.id" :value="eob.id">
                {{ formatDate(eob.dateOfService) }} - ${{ eob.totalBilled.toFixed(2) }}
              </option>
            </select>
            <p v-if="errors.explanationOfBenefitsId" class="form-error">{{ errors.explanationOfBenefitsId }}</p>
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
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              class="form-input"
              rows="3"
              :class="{ 'border-red-500': errors.description }"
            ></textarea>
            <p v-if="errors.description" class="form-error">{{ errors.description }}</p>
          </div>

          <div>
            <label for="amount" class="form-label">Amount</label>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              :class="{ 'border-red-500': errors.amount }"
            />
            <p v-if="errors.amount" class="form-error">{{ errors.amount }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/medical-service-events" class="btn btn-secondary">
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

const providers = ref<MedicalProvider[]>([])
const medicalBills = ref<MedicalBill[]>([])
const explanationOfBenefits = ref<ExplanationOfBenefits[]>([])

const form = reactive({
  medicalProviderId: '',
  medicalBillId: '',
  explanationOfBenefitsId: '',
  dateOfService: '',
  description: '',
  amount: undefined as number | undefined,
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

const loadMedicalBills = async () => {
  try {
    const response = await apiClient.get('/api/medical-bills')
    medicalBills.value = response.data.data
  } catch (err: any) {
    alert('Failed to load medical bills: ' + (err.message || 'Unknown error'))
  }
}

const loadExplanationOfBenefits = async () => {
  try {
    const response = await apiClient.get('/api/explanation-of-benefits')
    explanationOfBenefits.value = response.data.data
  } catch (err: any) {
    alert('Failed to load explanation of benefits: ' + (err.message || 'Unknown error'))
  }
}

const loadMedicalServiceEvent = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get(`/api/medical-service-events/${route.params.id}`)
    const event = response.data.data

    form.medicalProviderId = event.medicalProviderId
    form.medicalBillId = event.medicalBillId || ''
    form.explanationOfBenefitsId = event.explanationOfBenefitsId || ''
    form.dateOfService = new Date(event.dateOfService).toISOString().split('T')[0]
    form.description = event.description || ''
    form.amount = event.amount
  } catch (err: any) {
    error.value = err.message || 'Failed to load service event'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  errors.medicalProviderId = ''
  errors.medicalBillId = ''
  errors.explanationOfBenefitsId = ''
  errors.dateOfService = ''
  errors.description = ''
  errors.amount = ''

  let isValid = true

  if (!form.medicalProviderId) {
    errors.medicalProviderId = 'Medical provider is required'
    isValid = false
  }

  if (!form.dateOfService) {
    errors.dateOfService = 'Date of service is required'
    isValid = false
  }

  if (form.amount !== undefined && form.amount < 0) {
    errors.amount = 'Amount must be positive'
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
      medicalBillId: form.medicalBillId || undefined,
      explanationOfBenefitsId: form.explanationOfBenefitsId || undefined,
      dateOfService: form.dateOfService,
      description: form.description.trim() || undefined,
      amount: form.amount,
    }

    await apiClient.put(`/api/medical-service-events/${route.params.id}`, data)
    router.push('/medical-service-events')
  } catch (err: any) {
    if (err.response?.data?.details) {
      // Handle validation errors from server
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to update service event: ' + (err.message || 'Unknown error'))
    }
  } finally {
    saving.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadProviders()
  loadMedicalBills()
  loadExplanationOfBenefits()
  loadMedicalServiceEvent()
})
</script>