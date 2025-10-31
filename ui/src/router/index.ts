import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-bills',
      name: 'medical-bills',
      component: () => import('@/views/MedicalBillsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-bills/create',
      name: 'create-medical-bill',
      component: () => import('@/views/CreateMedicalBillView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-bills/:id/edit',
      name: 'edit-medical-bill',
      component: () => import('@/views/EditMedicalBillView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/providers',
      name: 'providers',
      component: () => import('@/views/ProvidersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/providers/create',
      name: 'create-provider',
      component: () => import('@/views/CreateProviderView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/providers/:id/edit',
      name: 'edit-provider',
      component: () => import('@/views/EditProviderView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-bill-charges',
      name: 'medical-bill-charges',
      component: () => import('@/views/MedicalBillChargesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-bill-charges/create',
      name: 'create-medical-bill-charge',
      component: () => import('@/views/CreateMedicalBillChargeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-bill-charges/:id/edit',
      name: 'edit-medical-bill-charge',
      component: () => import('@/views/EditMedicalBillChargeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/collection-bills',
      name: 'collection-bills',
      component: () => import('@/views/CollectionBillsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/collection-bills/create',
      name: 'create-collection-bill',
      component: () => import('@/views/CreateCollectionBillView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/collection-bills/:id/edit',
      name: 'edit-collection-bill',
      component: () => import('@/views/EditCollectionBillView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-service-events',
      name: 'medical-service-events',
      component: () => import('@/views/MedicalServiceEventsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-service-events/create',
      name: 'create-medical-service-event',
      component: () => import('@/views/CreateMedicalServiceEventView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/medical-service-events/:id/edit',
      name: 'edit-medical-service-event',
      component: () => import('@/views/EditMedicalServiceEventView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/explanation-of-benefits',
      name: 'explanation-of-benefits',
      component: () => import('@/views/ExplanationOfBenefitsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/explanation-of-benefits/create',
      name: 'create-explanation-of-benefits',
      component: () => import('@/views/CreateExplanationOfBenefitsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/explanation-of-benefits/:id/edit',
      name: 'edit-explanation-of-benefits',
      component: () => import('@/views/EditExplanationOfBenefitsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }
  
  // Handle routes that require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Handle routes that require guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router