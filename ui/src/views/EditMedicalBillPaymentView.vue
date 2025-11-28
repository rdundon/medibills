<template>
  <div class="edit-medical-bill-payment-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Edit Medical Bill Payment</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading medical bill payment...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/medical-bill-payments" class="btn btn-secondary mt-4">
            Back to Payments
          </router-link>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
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
import { medicalBillPaymentsService } from '@/services/medicalBillPaymentsService'

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
const saving = ref(false)
const error = ref('')

const loadMedicalBills = async () => {
  try {
    const response = await apiClient.get('/api/medical-bills')
    medicalBills.value = response.data.data
  } catch (err: any) {
    console.error('Failed to load medical bills:', err.message)
  }
}

const loadPayment = async () => {
  loading.value = true
  error.value = ''

  try {
    const payment = await medicalBillPaymentsService.getById(route.params.id as string)

    form.amount = payment.amount
    form.date = payment.date.split('T')[0] // Convert to YYYY-MM-DD format
    form.notes = payment.notes || ''
    form.medicalBillIds = payment.medicalBills?.map((bill: any) => bill.id) || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load medical bill payment'
  } finally {
    loading.value = false
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

  saving.value = true

  try {
    const paymentId = route.params.id as string
    const data = {
      amount: form.amount,
      date: form.date,
      notes: form.notes,
    }

    await medicalBillPaymentsService.update(paymentId, data)

    // Get current associations
    const currentPayment = await medicalBillPaymentsService.getById(paymentId)
    const currentMedicalBillIds = currentPayment.medicalBills?.map((bill: any) => bill.id) || []

    // Remove associations that are no longer selected
    const toRemove = currentMedicalBillIds.filter((id: string) => !form.medicalBillIds.includes(id))
    for (const billId of toRemove) {
      await medicalBillPaymentsService.removeMedicalBill(paymentId, billId)
    }

    // Add new associations
    const toAdd = form.medicalBillIds.filter(id => !currentMedicalBillIds.includes(id))
    if (toAdd.length > 0) {
      await medicalBillPaymentsService.addMedicalBills(paymentId, toAdd)
    }

    router.push('/medical-bill-payments')
  } catch (err: any) {
    if (err.response?.data?.details) {
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to update medical bill payment: ' + (err.message || 'Unknown error'))
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadMedicalBills()
  loadPayment()
})
</script>