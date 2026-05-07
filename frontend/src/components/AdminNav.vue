<template>
  <aside class="admin-sidebar glass-card">
    <div class="section-heading">
      <span class="kicker">Control Center</span>
      <h2>RaffleSync Admin</h2>
      <p class="muted">统一管理报名、奖项、抽奖与兑奖流程。</p>
    </div>

    <nav>
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="admin-link">
        <span>{{ item.label }}</span>
        <small>{{ item.short }}</small>
      </RouterLink>
    </nav>

    <button class="secondary-btn" @click="logout">退出登录</button>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const items = [
  { to: '/admin', label: '概览', short: '00' },
  { to: '/admin/participants', label: '报名名单', short: '01' },
  { to: '/admin/prizes', label: '奖项设置', short: '02' },
  { to: '/admin/draw', label: '执行抽奖', short: '03' },
  { to: '/admin/claims', label: '兑奖核验', short: '04' },
]

function logout() {
  localStorage.removeItem('raffle-admin-token')
  localStorage.removeItem('raffle-last-winner')
  router.push('/admin/login')
}
</script>
