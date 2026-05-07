<template>
  <div class="centered-shell view-shell">
    <form class="glass-card login-card" @submit.prevent="login">
      <p class="eyebrow">Admin</p>
      <h1>后台登录</h1>
      <p class="muted">进入抽奖控制台，管理报名数据与开奖流程。</p>

      <label>
        <span>账号</span>
        <input v-model="form.username" />
      </label>

      <label>
        <span>密码</span>
        <input v-model="form.password" type="password" />
      </label>

      <button class="primary-btn">登录</button>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const errorMessage = ref('')
const form = reactive({
  username: 'admin',
  password: 'admin123',
})

async function login() {
  errorMessage.value = ''
  try {
    const { data } = await api.post('/auth/login', form)
    localStorage.setItem('raffle-admin-token', data.token)
    router.push('/admin')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '登录失败'
  }
}
</script>
