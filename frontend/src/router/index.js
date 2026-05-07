import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/success', name: 'success', component: () => import('../views/SuccessView.vue') },
  { path: '/screen', name: 'screen', component: () => import('../views/LotteryScreenView.vue') },
  { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/AdminLoginView.vue') },
  { path: '/admin', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboardView.vue') },
  { path: '/admin/participants', name: 'admin-participants', component: () => import('../views/admin/AdminParticipantsView.vue') },
  { path: '/admin/prizes', name: 'admin-prizes', component: () => import('../views/admin/AdminPrizesView.vue') },
  { path: '/admin/draw', name: 'admin-draw', component: () => import('../views/admin/AdminDrawView.vue') },
  { path: '/admin/claims', name: 'admin-claims', component: () => import('../views/admin/AdminClaimsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const publicNames = ['register', 'success', 'screen', 'admin-login']
  const token = localStorage.getItem('raffle-admin-token')
  if (!publicNames.includes(to.name) && !token) {
    return '/admin/login'
  }
  return true
})

export default router
