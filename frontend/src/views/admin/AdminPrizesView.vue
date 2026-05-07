<template>
  <AdminShell eyebrow="Prizes" title="奖项设置" description="创建与查看奖项，为抽奖流程准备奖池。">
    <section class="two-column-grid">
      <form class="glass-card prize-form" @submit.prevent="createPrize">
        <div class="section-heading">
          <span class="kicker">Create Prize</span>
          <h2>创建奖项</h2>
        </div>

        <label>
          <span>奖项名称</span>
          <input v-model="form.name" />
        </label>

        <label>
          <span>数量</span>
          <input v-model.number="form.quantity" type="number" min="1" />
        </label>

        <label>
          <span>说明</span>
          <textarea v-model="form.description" rows="4"></textarea>
        </label>

        <button class="primary-btn">保存奖项</button>
      </form>

      <section class="glass-card prize-list">
        <div class="section-heading">
          <span class="kicker">Current Pool</span>
          <h2>当前奖项</h2>
        </div>

        <div v-if="prizes.length" class="prize-stack">
          <article v-for="prize in prizes" :key="prize.id" class="prize-item">
            <strong>{{ prize.name }}</strong>
            <span class="status-pill">{{ prize.win_count }}/{{ prize.quantity }}</span>
            <p class="muted">{{ prize.description || '暂无奖项说明' }}</p>
          </article>
        </div>

        <div v-else class="empty-state">还没有创建任何奖项</div>
      </section>
    </section>
  </AdminShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../api'
import AdminShell from '../../components/AdminShell.vue'

const prizes = ref([])
const form = reactive({
  name: '',
  quantity: 1,
  description: '',
})

async function loadPrizes() {
  const { data } = await api.get('/admin/prizes')
  prizes.value = data
}

async function createPrize() {
  await api.post('/admin/prizes', form)
  form.name = ''
  form.quantity = 1
  form.description = ''
  await loadPrizes()
}

onMounted(loadPrizes)
</script>
