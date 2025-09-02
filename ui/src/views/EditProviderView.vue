<template>
  <div class="edit-provider-view">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Edit Medical Provider</h2>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-gray-600">Loading provider...</p>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600">{{ error }}</p>
          <router-link to="/providers" class="btn btn-secondary mt-4">
            Back to Providers
          </router-link>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label for="name" class="form-label">Provider Name *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              required
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>

          <div>
            <label for="address" class="form-label">Address</label>
            <textarea
              id="address"
              v-model="form.address"
              class="form-input"
              rows="3"
              :class="{ 'border-red-500': errors.address }"
            ></textarea>
            <p v-if="errors.address" class="form-error">{{ errors.address }}</p>
          </div>

          <div>
            <label for="phone" class="form-label">Phone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="form-input"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
          </div>

          <div>
            <label for="website" class="form-label">Website</label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              class="form-input"
              placeholder="https://example.com"
              :class="{ 'border-red-500': errors.website }"
            />
            <p v-if="errors.website" class="form-error">{{ errors.website }}</p>
          </div>

          <div>
            <label for="paymentWebsite" class="form-label">Payment Website</label>
            <input
              id="paymentWebsite"
              v-model="form.paymentWebsite"
              type="url"
              class="form-input"
              placeholder="https://payments.example.com"
              :class="{ 'border-red-500': errors.paymentWebsite }"
            />
            <p v-if="errors.paymentWebsite" class="form-error">{{ errors.paymentWebsite }}</p>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link to="/providers" class="btn btn-secondary">
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
  address?: string
  phone?: string
  website?: string
  paymentWebsite?: string
  createdAt: string
  updatedAt: string
}

const form = reactive({
  name: '',
  address: '',
  phone: '',
  website: '',
  paymentWebsite: '',
})

const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const loadProvider = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await apiClient.get(`/api/medical-providers/${route.params.id}`)
    const provider = response.data.data

    form.name = provider.name
    form.address = provider.address || ''
    form.phone = provider.phone || ''
    form.website = provider.website || ''
    form.paymentWebsite = provider.paymentWebsite || ''
  } catch (err: any) {
    error.value = err.message || 'Failed to load provider'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  errors.name = ''
  errors.address = ''
  errors.phone = ''
  errors.website = ''
  errors.paymentWebsite = ''

  let isValid = true

  if (!form.name.trim()) {
    errors.name = 'Provider name is required'
    isValid = false
  }

  if (form.website && !form.website.match(/^https?:\/\/.+/)) {
    errors.website = 'Website must be a valid URL starting with http:// or https://'
    isValid = false
  }

  if (form.paymentWebsite && !form.paymentWebsite.match(/^https?:\/\/.+/)) {
    errors.paymentWebsite = 'Payment website must be a valid URL starting with http:// or https://'
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
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      website: form.website.trim() || undefined,
      paymentWebsite: form.paymentWebsite.trim() || undefined,
    }

    await apiClient.put(`/api/medical-providers/${route.params.id}`, data)
    router.push('/providers')
  } catch (err: any) {
    if (err.response?.data?.details) {
      // Handle validation errors from server
      err.response.data.details.forEach((detail: any) => {
        const field = detail.path?.[0] || 'general'
        errors[field] = detail.message
      })
    } else {
      alert('Failed to update provider: ' + (err.message || 'Unknown error'))
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProvider()
})
</script>