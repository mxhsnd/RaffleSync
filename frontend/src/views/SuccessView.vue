<template>
  <PublicShell>
    <section class="success-shell">
      <div class="glass-card success-card">
        <p class="eyebrow">Registration Complete</p>
        <h1>{{ alreadyRegistered ? '该学号已参与抽奖' : '欢迎加入抽奖' }}</h1>
        <p class="subtitle">
          {{ alreadyRegistered ? '已返回你之前分配的抽奖编号。' : '你的专属抽奖编号已生成，请妥善保存。' }}
        </p>

        <div class="raffle-number">{{ raffleNo }}</div>

        <div class="info-strip" style="width: 100%">
          <article class="surface-card info-card">
            <span>兑奖提醒</span>
            <strong>若中奖，请凭学生证或教务在线首页兑奖</strong>
          </article>
          <article class="surface-card info-card">
            <span>下一步</span>
            <strong>等待大屏开奖</strong>
          </article>
        </div>

        <div class="button-row">
          <RouterLink class="primary-btn inline-btn" to="/">返回首页</RouterLink>
          <RouterLink class="secondary-btn inline-btn" to="/screen">查看大屏</RouterLink>
        </div>
      </div>
    </section>
  </PublicShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicShell from '../components/PublicShell.vue'

const route = useRoute()
const raffleNo = computed(() => route.query.raffleNo || 'R000000')
const alreadyRegistered = computed(() => route.query.alreadyRegistered === 'true')
</script>
