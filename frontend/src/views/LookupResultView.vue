<template>
  <PublicShell>
    <section class="lookup-result-shell">
      <div class="lookup-stage">
        <article class="lookup-ticket-board">
          <div class="ticket-aura ticket-aura-left"></div>
          <div class="ticket-aura ticket-aura-right"></div>

          <div class="lookup-ticket-main">
            <div class="ticket-main-inner">
              <div class="ticket-brand-row">
                <div>
                  <p class="eyebrow">Draw Access</p>
                  <h1>{{ hasResult ? '抽奖凭证' : '未生成票据' }}</h1>
                </div>
                <div class="ticket-badge">Entry Pass</div>
              </div>

              <div class="ticket-serial-row">
                <div class="ticket-serial-labels">
                  <span>Session 07</span>
                  <span>Claim Rule</span>
                  <span>Serial</span>
                </div>
                <div class="ticket-number-stage">
                  <div class="ticket-number-panel">
                    <span class="ticket-number-caption">Official Raffle Number</span>
                    <div class="ticket-number-core">{{ raffleNo }}</div>
                  </div>
                </div>
              </div>

              <div class="ticket-copy-row">
                <p class="subtitle">
                  {{ hasResult ? '此票仅用于抽奖编号查询与现场兑奖核验，请妥善保存。' : '请返回首页重新输入学号，生成你的抽奖凭证。' }}
                </p>
              </div>

              <div class="ticket-meta-grid">
                <article class="ticket-meta-block">
                  <span>Student No</span>
                  <strong>{{ studentNo }}</strong>
                </article>
                <article class="ticket-meta-block">
                  <span>Claim Rule</span>
                  <strong>若中奖，请凭学生证或教务在线首页兑奖</strong>
                </article>
              </div>

              <div class="ticket-actions button-row">
                <RouterLink class="primary-btn inline-btn" to="/">返回首页</RouterLink>
                <RouterLink class="secondary-btn inline-btn" to="/screen">查看大屏</RouterLink>
              </div>
            </div>
          </div>

          <aside class="lookup-ticket-stub">
            <div class="ticket-stub-inner">
              <span class="ticket-stub-kicker">Prize Stub</span>
              <div class="ticket-stub-code">{{ shortCode }}</div>
              <div class="ticket-stub-stack">
                <span>RaffleSync</span>
                <span>Draw Access</span>
                <span>{{ studentNo }}</span>
                <span>{{ raffleNo }}</span>
              </div>
            </div>
          </aside>
        </article>
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
const studentNo = computed(() => route.query.studentNo || '未提供学号')
const hasResult = computed(() => Boolean(route.query.raffleNo && route.query.studentNo))
const shortCode = computed(() => raffleNo.value.slice(-4))
</script>
