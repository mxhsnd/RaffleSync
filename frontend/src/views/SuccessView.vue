<template>
  <PublicShell>
    <section class="success-shell">
      <div class="glass-card success-card">
        <p class="eyebrow">Registration Complete</p>
        <h1>欢迎加入抽奖</h1>
        <p class="subtitle">请保存你的专属编号，抽奖与兑奖都将以它为准。</p>

        <div class="raffle-number">{{ raffleNo }}</div>

        <div class="info-strip" style="width: 100%">
          <article class="surface-card info-card">
            <span>昵称</span>
            <strong>{{ nickname }}</strong>
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
const nickname = computed(() => route.query.nickname || '幸运来宾')
</script>
