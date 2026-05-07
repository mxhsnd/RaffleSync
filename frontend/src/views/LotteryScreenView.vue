<template>
  <div class="screen-shell view-shell">
    <div class="screen-content">
      <p class="eyebrow">Live Draw Screen</p>
      <h1>幸运编号揭晓</h1>
      <p class="subtitle">等待抽奖控制台推送结果，大屏将自动更新最新中奖人。</p>

      <div class="screen-number">{{ rollingNumber }}</div>

      <Transition name="winner-pop">
        <div v-if="winner.raffle_no" class="glass-card winner-panel">
          <div class="section-heading">
            <span class="kicker">Latest Winner</span>
            <h2>{{ winner.raffle_no }}</h2>
            <p class="muted">{{ winner.nickname }}</p>
          </div>
          <span class="status-pill success">恭喜中奖</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const raffleNumbers = Array.from({ length: 40 }, (_, index) => `R${String(index + 1).padStart(6, '0')}`)
const currentIndex = ref(0)
const winner = ref({ raffle_no: '', nickname: '' })
let timer = null

const rollingNumber = computed(() => raffleNumbers[currentIndex.value % raffleNumbers.length])

function syncWinner() {
  const raw = localStorage.getItem('raffle-last-winner')
  if (!raw) return
  try {
    winner.value = JSON.parse(raw)
  } catch {
  }
}

function handleStorage(event) {
  if (event.key === 'raffle-last-winner') {
    syncWinner()
  }
}

onMounted(() => {
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % raffleNumbers.length
  }, 120)
  syncWinner()
  window.addEventListener('storage', handleStorage)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
  window.removeEventListener('storage', handleStorage)
})
</script>
