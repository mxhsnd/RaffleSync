<template>
  <PublicShell>
    <section class="ticket-page-shell">
      <TicketRenderer
        :theme="ticketTheme"
        :raffle-no="raffleNo"
        :title="alreadyRegistered ? '该学号已参与抽奖' : '欢迎加入抽奖'"
        :subtitle="alreadyRegistered ? '已返回你之前分配的抽奖编号。' : '你的专属抽奖编号已生成，请妥善保存。'"
        badge="Registration Result"
        hint="若中奖，请凭学生证或教务在线首页兑奖"
        :already-registered="alreadyRegistered"
      />

      <div class="ticket-page-actions button-row">
        <RouterLink class="primary-btn inline-btn" to="/">返回首页</RouterLink>
        <RouterLink class="secondary-btn inline-btn" to="/screen">查看大屏</RouterLink>
      </div>
    </section>
  </PublicShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import PublicShell from '../components/PublicShell.vue'
import TicketRenderer from '../components/tickets/TicketRenderer.vue'

const route = useRoute()
const raffleNo = computed(() => route.query.raffleNo || 'R000000')
const alreadyRegistered = computed(() => route.query.alreadyRegistered === 'true')
const ticketTheme = ref('aurora')

onMounted(async () => {
  const { data } = await api.get('/public/settings')
  ticketTheme.value = data.ticketTheme || 'aurora'
})
</script>
