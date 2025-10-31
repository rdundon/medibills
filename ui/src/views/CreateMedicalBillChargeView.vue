<template>
  <div class="create-medical-bill-charge-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Add Medical Bill Charge</h2>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label for="medicalBillId" class="form-label">Medical Bill *</label>
            <select
              id="medicalBillId"
              v-model="form.medicalBillId"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.medicalBillId }"
            >
              <option value="">Select a medical bill</option>
              <option v-for="bill in bills" :key="bill.id" :value="bill.id">
                {{ bill.medicalProvider?.name }} - {{ formatDate(bill.dateOfService) }} (${{ bill.total.toFixed(2) }})
              </option>
            </select>
            <p v-if="errors.medicalBillId" class="form-error">{{ errors.medicalBillId }}</p>
          </div>

          <div>
            <label for="amount" class="form-label">Amount *</label>
            <input
              id="amount"
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.amount }"
            />
            <p v-if="errors.amount" class="form-error">{{ errors.amount }}</p>
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

          <div class="flex justify-end space-x-4">
            <router-link to="/medical-bill-charges" class="btn btn-secondary">
              Cancel
            </router-link>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="spinner spinner-sm mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Charge' }}
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
  medicalProviderId: string
  dateOfService: string
  total: number
  medicalProvider?: MedicalProvider
}

const bills = ref<MedicalBill[]>([])
const form = reactive({
  medicalBillId: '',
  amount: 0,
  description: '',
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)

const loadBills = async () => {
  try {
    const response = await apiClient.get('/api/medical-bills')
    bills.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load medical bills:', err.message)
  }
}

const validateForm = () => {
  errors.medicalBillId = ''
  errors.amount = ''
  errors.description = ''

  let isValid = true

  if (!form.medicalBillId) {
    errors.medicalBillId = 'Medical bill is required'
    isValid = false
  }

  if (form.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
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
      medicalBillId: form.medicalBillId,
      amount: form.amount,
      description: form.description.trim() || undefined,
    }

    await apiClient.post('/api/medical-bill-charges', data)
    router.push('/medical-bill-charges')
  } catch (err: any) {
    if (err.response?.data?.details) {
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to create charge: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadBills()
})
</script>