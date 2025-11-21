<template>
  <div class="create-medical-service-event-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Add Medical Service Event</h2>
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
            <label for="medicalBillIds" class="form-label">Medical Bills (Optional)</label>
            <select
              id="medicalBillIds"
              v-model="form.medicalBillIds"
              class="form-input"
              multiple
              :class="{ 'border-red-500': errors.medicalBillIds }"
            >
              <option v-for="bill in medicalBills" :key="bill.id" :value="bill.id">
                {{ formatDate(bill.dateOfService) }} - ${{ bill.total.toFixed(2) }}
              </option>
            </select>
            <p class="text-sm text-gray-600 mt-1">Hold Ctrl/Cmd to select multiple medical bills</p>
            <p v-if="errors.medicalBillIds" class="form-error">{{ errors.medicalBillIds }}</p>
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
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="spinner spinner-sm mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Service Event' }}
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
  medicalBillIds: [] as string[],
  explanationOfBenefitsId: '',
  dateOfService: '',
  description: '',
  amount: undefined as number | undefined,
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

const validateForm = () => {
  errors.medicalProviderId = ''
  errors.medicalBillIds = ''
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

  loading.value = true

  try {
    const data = {
      medicalProviderId: form.medicalProviderId,
      explanationOfBenefitsId: form.explanationOfBenefitsId || undefined,
      dateOfService: form.dateOfService,
      description: form.description.trim() || undefined,
      amount: form.amount,
    }

    const response = await apiClient.post('/api/medical-service-events', data)
    const eventId = response.data.data.id

    // Add medical bill associations if any
    if (form.medicalBillIds.length > 0) {
      for (const billId of form.medicalBillIds) {
        await apiClient.post(`/api/medical-bills/${billId}/service-events`, {
          serviceEventIds: [eventId],
        })
      }
    }

    router.push('/medical-service-events')
  } catch (err: any) {
    if (err.response?.data?.details) {
      // Handle validation errors from server
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to create service event: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadProviders()
  loadMedicalBills()
  loadExplanationOfBenefits()
})
</script>