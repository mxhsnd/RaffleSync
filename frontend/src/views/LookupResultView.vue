<template>
  <PublicShell>
    <section class="ticket-page-shell">
      <TicketRenderer
        :theme="ticketTheme"
        :raffle-no="raffleNo"
        :student-no="studentNo"
        :title="hasResult ? '抽奖凭证' : '未生成票据'"
        :subtitle="hasResult ? '此票仅用于抽奖编号查询与现场兑奖核验，请妥善保存。' : '请返回首页重新输入学号，生成你的抽奖凭证。'"
        badge="Lookup Ticket"
        hint="若中奖，请凭学生证或教务在线首页兑奖"
        :show-student-no="hasResult"
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
const studentNo = computed(() => route.query.studentNo || '未提供学号')
const hasResult = computed(() => Boolean(route.query.raffleNo && route.query.studentNo))
const ticketTheme = ref('aurora')

onMounted(async () => {
  const { data } = await api.get('/public/settings')
  ticketTheme.value = data.ticketTheme || 'aurora'
})
</script>
