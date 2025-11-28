import apiClient from './api'

export interface MedicalBillPayment {
  id: string
  userId: string
  amount: number
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
  medicalBills?: MedicalBill[]
}

export interface MedicalBill {
  id: string
  dateOfService: string
  total: number
  medicalProvider: {
    id: string
    name: string
  }
}

export const medicalBillPaymentsService = {
  async getAll() {
    const response = await apiClient.get('/api/medical-bill-payments')
    return response.data.data
  },

  async getById(id: string) {
    const response = await apiClient.get(`/api/medical-bill-payments/${id}`)
    return response.data.data
  },

  async create(data: { amount: number; date: string; notes?: string }) {
    const response = await apiClient.post('/api/medical-bill-payments', data)
    return response.data.data
  },

  async update(id: string, data: { amount?: number; date?: string; notes?: string }) {
    const response = await apiClient.put(`/api/medical-bill-payments/${id}`, data)
    return response.data.data
  },

  async delete(id: string) {
    await apiClient.delete(`/api/medical-bill-payments/${id}`)
  },

  async addMedicalBills(id: string, medicalBillIds: string[]) {
    const response = await apiClient.post(`/api/medical-bill-payments/${id}/medical-bills`, {
      medicalBillIds
    })
    return response.data.data
  },

  async removeMedicalBill(id: string, billId: string) {
    await apiClient.delete(`/api/medical-bill-payments/${id}/medical-bills/${billId}`)
  }
}