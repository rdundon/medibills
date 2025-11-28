<template>
  <div class="create-medical-bill-payment-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Add Medical Bill Payment</h2>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitForm" class="space-y-6">
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
            <label for="date" class="form-label">Date *</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.date }"
            />
            <p v-if="errors.date" class="form-error">{{ errors.date }}</p>
          </div>

          <div>
            <label for="notes" class="form-label">Notes</label>
            <textarea
              id="notes"
              v-model="form.notes"
              class="form-input"
              rows="3"
              :class="{ 'border-red-500': errors.notes }"
            ></textarea>
            <p v-if="errors.notes" class="form-error">{{ errors.notes }}</p>
          </div>

          <div>
            <label for="medicalBillIds" class="form-label">Associated Medical Bills</label>
            <select
              id="medicalBillIds"
              v-model="form.medicalBillIds"
              class="form-input"
              multiple
              :class="{ 'border-red-500': errors.medicalBillIds }"
            >
              <option v-for="bill in medicalBills" :key="bill.id" :value="bill.id">
                {{ formatDate(bill.dateOfService) }} - {{ bill.medicalProvider?.name }} - ${{ bill.total.toFixed(2) }}
              </option>
            </select>
            <p class="text-sm text-gray-600 mt-1">Hold Ctrl/Cmd to select multiple medical bills</p>
            <p v-if="errors.medicalBillIds" class="form-error">{{ errors.medicalBillIds }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/medical-bill-payments" class="btn btn-secondary">
              Cancel
            </router-link>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              <span v-if="loading" class="spinner spinner-sm mr-2"></span>
              {{ loading ? 'Creating...' : 'Create Payment' }}
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
import { medicalBillPaymentsService } from '@/services/medicalBillPaymentsService'

const router = useRouter()

interface MedicalProvider {
  id: string
  name: string
}

interface MedicalBill {
  id: string
  dateOfService: string
  total: number
  medicalProvider?: MedicalProvider
}

const medicalBills = ref<MedicalBill[]>([])
const form = reactive({
  amount: 0,
  date: '',
  notes: '',
  medicalBillIds: [] as string[],
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)

const loadMedicalBills = async () => {
  try {
    const response = await apiClient.get('/api/medical-bills')
    medicalBills.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load medical bills:', err.message)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const validateForm = () => {
  errors.amount = ''
  errors.date = ''

  let isValid = true

  if (form.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
    isValid = false
  }

  if (!form.date) {
    errors.date = 'Date is required'
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
      amount: form.amount,
      date: form.date,
      notes: form.notes,
    }

    const response = await medicalBillPaymentsService.create(data)
    const paymentId = response.id

    // Add medical bill associations if any
    if (form.medicalBillIds.length > 0) {
      await medicalBillPaymentsService.addMedicalBills(paymentId, form.medicalBillIds)
    }

    router.push('/medical-bill-payments')
  } catch (err: any) {
    if (err.response?.data?.details) {
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to create medical bill payment: ' + (err.message || 'Unknown error'))
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMedicalBills()
})
</script>