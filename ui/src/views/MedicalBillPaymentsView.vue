<template>
  <div class="medical-bill-payments-view">
    <div class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h2 class="card-title">Medical Bill Payments</h2>
          <router-link to="/medical-bill-payments/create" class="btn btn-primary">
            Add Payment
          </router-link>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading medical bill payments...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadPayments" class="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>

        <div v-else-if="payments.length === 0" class="text-center py-8">
          <p class="text-gray-600">No medical bill payments found.</p>
          <router-link to="/medical-bill-payments/create" class="btn btn-primary mt-4">
            Add Your First Payment
          </router-link>
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Associated Bills</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in payments" :key="payment.id">
                  <td>{{ formatDate(payment.date) }}</td>
                  <td class="font-medium">${{ payment.amount.toFixed(2) }}</td>
                  <td class="text-sm">{{ payment.notes || '-' }}</td>
                  <td>
                    <div v-if="payment.medicalBills && payment.medicalBills.length > 0">
                      <div v-for="bill in payment.medicalBills" :key="bill.id" class="text-sm">
                        {{ bill.medicalProvider.name }} - {{ formatDate(bill.dateOfService) }}
                      </div>
                    </div>
                    <div v-else class="text-gray-500">No bills associated</div>
                  </td>
                  <td>
                    <div class="flex space-x-2">
                      <router-link :to="`/medical-bill-payments/${payment.id}/edit`" class="btn btn-sm btn-secondary">
                        Edit
                      </router-link>
                      <button @click="deletePayment(payment.id)" class="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { medicalBillPaymentsService, type MedicalBillPayment } from '@/services/medicalBillPaymentsService'

const payments = ref<MedicalBillPayment[]>([])
const loading = ref(false)
const error = ref('')

const loadPayments = async () => {
  loading.value = true
  error.value = ''

  try {
    payments.value = await medicalBillPaymentsService.getAll()
  } catch (err: any) {
    error.value = err.message || 'Failed to load medical bill payments'
  } finally {
    loading.value = false
  }
}

const deletePayment = async (id: string) => {
  if (!confirm('Are you sure you want to delete this medical bill payment?')) {
    return
  }

  try {
    await medicalBillPaymentsService.delete(id)
    await loadPayments() // Reload the list
  } catch (err: any) {
    alert('Failed to delete medical bill payment: ' + (err.message || 'Unknown error'))
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadPayments()
})
</script>