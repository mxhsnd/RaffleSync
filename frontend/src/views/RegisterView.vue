<template>
  <PublicShell>
    <section class="register-stage">
      <div class="lookup-layout two-column-grid">
        <form class="glass-card form-card register-card" @submit.prevent="submitRegister">
          <div class="section-heading register-heading">
            <span class="kicker">Get in</span>
            <h2>参与抽奖</h2>
            <p class="muted">输入学号，快速进入抽奖名单。</p>
          </div>

          <label>
            <span>学号</span>
            <input v-model="registerForm.studentNo" placeholder="输入学号领取抽奖编号" />
          </label>

          <button class="primary-btn register-cta" :disabled="registerSubmitting">
            {{ registerSubmitting ? '提交中...' : '参与抽奖' }}
          </button>

          <p class="muted">若中奖，请凭学生证或教务在线首页兑奖。</p>
          <p v-if="registerErrorMessage" class="error-text">{{ registerErrorMessage }}</p>
        </form>

        <form class="glass-card form-card register-card lookup-card" @submit.prevent="submitLookup">
          <div class="section-heading register-heading">
            <span class="kicker">Lookup</span>
            <h2>查询信息</h2>
            <p class="muted">输入已参与抽奖的学号，快速找回你的编号。</p>
          </div>

          <label>
            <span>学号</span>
            <input v-model="lookupForm.studentNo" placeholder="输入学号查询抽奖编号" />
          </label>

          <button class="secondary-btn register-cta" :disabled="lookupSubmitting">
            {{ lookupSubmitting ? '查询中...' : '查询抽奖编号' }}
          </button>

          <div class="lookup-tips">
            <span class="tag">回查编号</span>
            <span class="tag">票券展示</span>
          </div>
          <p v-if="lookupErrorMessage" class="error-text">{{ lookupErrorMessage }}</p>
        </form>
      </div>
    </section>
  </PublicShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import PublicShell from '../components/PublicShell.vue'

const router = useRouter()
const registerSubmitting = ref(false)
const lookupSubmitting = ref(false)
const registerErrorMessage = ref('')
const lookupErrorMessage = ref('')
const registerForm = reactive({
  studentNo: '',
})
const lookupForm = reactive({
  studentNo: '',
})

async function submitRegister() {
  registerErrorMessage.value = ''
  registerSubmitting.value = true
  try {
    const { data } = await api.post('/public/register', registerForm)
    router.push({
      name: 'success',
      query: {
        raffleNo: data.raffleNo,
        alreadyRegistered: String(data.alreadyRegistered),
      },
    })
  } catch (error) {
    registerErrorMessage.value = error.response?.data?.message || '提交失败，请稍后重试'
  } finally {
    registerSubmitting.value = false
  }
}

async function submitLookup() {
  lookupErrorMessage.value = ''
  lookupSubmitting.value = true
  try {
    const { data } = await api.post('/public/lookup', lookupForm)
    router.push({
      name: 'lookup-result',
      query: {
        raffleNo: data.raffleNo,
        studentNo: data.studentNo,
      },
    })
  } catch (error) {
    lookupErrorMessage.value = error.response?.data?.message || '查询失败，请稍后重试'
  } finally {
    lookupSubmitting.value = false
  }
}
</script>
