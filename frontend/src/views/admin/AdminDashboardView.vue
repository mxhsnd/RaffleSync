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

    <section class="glass-card theme-settings-card">
      <div class="section-heading">
        <span class="kicker">Ticket Themes</span>
        <h2>票据样式切换</h2>
        <p class="muted">选择 5 套完全不同的票据风格之一，前台成功页和查询页会立即使用当前主题。</p>
      </div>

      <div class="theme-option-grid">
        <button
          v-for="option in themeOptions"
          :key="option.value"
          type="button"
          class="theme-option-card"
          :class="{ 'theme-option-card-active': selectedTheme === option.value }"
          @click="selectedTheme = option.value"
        >
          <div class="theme-option-preview" :class="`theme-preview-${option.value}`"></div>
          <strong>{{ option.label }}</strong>
          <span class="muted">{{ option.description }}</span>
        </button>
      </div>

      <div class="theme-settings-footer">
        <p class="muted">当前生效主题：{{ currentThemeLabel }}</p>
        <button class="primary-btn" :disabled="saving" @click="saveTheme">
          {{ saving ? '保存中...' : '保存票据样式' }}
        </button>
      </div>
    </section>
  </AdminShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../api'
import AdminShell from '../../components/AdminShell.vue'
import MetricCard from '../../components/MetricCard.vue'

const stats = reactive({
  participants: 0,
  prizes: 0,
  winners: 0,
  claimed: 0,
})

const themeOptions = [
  { value: 'aurora', label: 'Aurora', description: '极光玻璃与光晕卡片' },
  { value: 'retro', label: 'Retro', description: '复古纸票与印章感' },
  { value: 'minimal', label: 'Minimal', description: '极简展板与留白' },
  { value: 'festival', label: 'Festival', description: '庆典彩带与高饱和色' },
  { value: 'blueprint', label: 'Blueprint', description: '蓝图网格与技术图纸感' },
]

const selectedTheme = ref('aurora')
const saving = ref(false)

const currentThemeLabel = computed(() => {
  return themeOptions.find((option) => option.value === selectedTheme.value)?.label || 'Aurora'
})

async function loadDashboard() {
  const { data } = await api.get('/admin/dashboard')
  Object.assign(stats, data)
}

async function loadSettings() {
  const { data } = await api.get('/admin/settings')
  selectedTheme.value = data.ticketTheme || 'aurora'
}

async function saveTheme() {
  saving.value = true
  try {
    const { data } = await api.put('/admin/settings', { ticketTheme: selectedTheme.value })
    selectedTheme.value = data.ticketTheme
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadDashboard(), loadSettings()])
})
</script>
