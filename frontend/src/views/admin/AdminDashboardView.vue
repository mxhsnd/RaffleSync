<template>
  <AdminShell eyebrow="Overview" title="抽奖总览" description="实时查看当前活动的核心数据与后台操作入口。">
    <section class="metrics-grid">
      <MetricCard label="报名人数" :value="stats.participants" hint="已完成登记的参与者数量" />
      <MetricCard label="奖项数量" :value="stats.prizes" hint="当前配置中的奖项总数" />
      <MetricCard label="已中奖" :value="stats.winners" hint="已经抽出的中奖记录" />
      <MetricCard label="已兑奖" :value="stats.claimed" hint="完成现场兑奖确认的人数" />
    </section>

    <section class="split-layout">
      <article class="surface-card info-card">
        <span>快速开始</span>
        <strong>抽奖操作建议</strong>
        <p class="muted">先确认奖项数量，再切换到执行抽奖页面发起开奖，大屏会读取最新中奖结果。</p>
      </article>

      <article class="surface-card info-card">
        <span>兑奖核验</span>
        <strong>现场编号即凭证</strong>
        <p class="muted">兑奖页会根据中奖编号查询中奖人与奖项信息，并支持一键确认兑奖。</p>
      </article>
    </section>
  </AdminShell>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import api from '../../api'
import AdminShell from '../../components/AdminShell.vue'
import MetricCard from '../../components/MetricCard.vue'

const stats = reactive({
  participants: 0,
  prizes: 0,
  winners: 0,
  claimed: 0,
})

onMounted(async () => {
  const { data } = await api.get('/admin/dashboard')
  Object.assign(stats, data)
})
</script>
