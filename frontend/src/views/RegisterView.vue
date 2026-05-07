<template>
  <PublicShell>
    <section class="register-stage">
      <form class="glass-card form-card register-card" @submit.prevent="submit">
        <div class="section-heading register-heading">
          <span class="kicker">Get in</span>
          <h2>参与抽奖</h2>
          <p class="muted">用更轻盈的流程，快速进入抽奖名单。</p>
        </div>

        <label>
          <span>昵称</span>
          <input v-model="form.nickname" placeholder="用于公开展示" />
        </label>

        <label>
          <span>学号</span>
          <input v-model="form.studentNo" placeholder="仅兑奖核验使用" />
        </label>

        <label>
          <span>姓名</span>
          <input v-model="form.realName" placeholder="仅兑奖核验使用" />
        </label>

        <button class="primary-btn register-cta" :disabled="submitting">
          {{ submitting ? '提交中...' : '参与抽奖' }}
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </form>
    </section>
  </PublicShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import PublicShell from '../components/PublicShell.vue'

const router = useRouter()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  nickname: '',
  studentNo: '',
  realName: '',
})

async function submit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    const { data } = await api.post('/public/register', form)
    router.push({ name: 'success', query: { raffleNo: data.raffleNo, nickname: data.nickname } })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
