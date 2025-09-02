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