<template>
  <AdminShell eyebrow="Draw" title="执行抽奖" description="选择奖项后立即开奖，并同步最新中奖结果到现场大屏。">
    <section class="two-column-grid">
      <div class="glass-card draw-panel">
        <div class="section-heading">
          <span class="kicker">Launch Draw</span>
          <h2>开始抽奖</h2>
        </div>

        <label>
          <span>选择奖项</span>
          <select v-model="selectedPrizeId">
            <option disabled value="">请选择奖项</option>
            <option v-for="prize in prizes" :key="prize.id" :value="prize.id">{{ prize.name }}</option>
          </select>
        </label>

        <button class="primary-btn" @click="draw">开始抽奖</button>
        <p v-if="message" class="success-text">{{ message }}</p>
      </div>

      <div class="glass-card draw-result">
        <div class="section-heading">
          <span class="kicker">Latest Winners</span>
          <h2>最新中奖结果</h2>
        </div>

        <div v-if="winners.length" class="winner-list">
          <article v-for="winner in winners" :key="winner.raffle_no" class="winner-item">
            <strong>{{ winner.raffle_no }}</strong>
            <span>{{ winner.student_no }}</span>
          </article>
        </div>

        <div v-else class="empty-state">尚未生成中奖结果</div>
      </div>
    </section>
  </AdminShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../api'
import AdminShell from '../../components/AdminShell.vue'

const prizes = ref([])
const selectedPrizeId = ref('')
const winners = ref([])
const message = ref('')

async function loadPrizes() {
  const { data } = await api.get('/admin/prizes')
  prizes.value = data
}

async function draw() {
  message.value = ''
  const { data } = await api.post('/admin/draw', { prizeId: selectedPrizeId.value })
  winners.value = data.winners
  if (data.winners[0]) {
    localStorage.setItem('raffle-last-winner', JSON.stringify(data.winners[0]))
  }
  message.value = `已抽出 ${data.winners.length} 位中奖者`
}

onMounted(loadPrizes)
</script>
