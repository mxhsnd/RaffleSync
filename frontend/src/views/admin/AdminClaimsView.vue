<template>
  <AdminShell eyebrow="Claims" title="兑奖核验" description="输入中奖编号，核对信息并确认兑奖状态。">
    <section class="two-column-grid">
      <form class="glass-card claim-form" @submit.prevent="verify">
        <div class="section-heading">
          <span class="kicker">Verify Winner</span>
          <h2>兑奖核验</h2>
        </div>

        <label>
          <span>中奖编号</span>
          <input v-model="raffleNo" placeholder="请输入中奖编号" />
        </label>

        <button class="primary-btn">查询</button>
      </form>

      <div v-if="claim" class="glass-card claim-result">
        <div class="section-heading">
          <span class="kicker">Verification Result</span>
          <h2>{{ claim.prize_name }}</h2>
        </div>

        <div class="panel-cluster">
          <p><span class="muted">编号：</span>{{ claim.raffle_no }}</p>
          <p><span class="muted">学号：</span>{{ claim.student_no }}</p>
          <p>
            <span class="muted">状态：</span>
            <span :class="['status-pill', claim.claimed ? 'success' : 'pending']">
              {{ claim.claimed ? '已兑奖' : '未兑奖' }}
            </span>
          </p>
          <p class="muted">若中奖，请凭学生证或教务在线首页兑奖。</p>
        </div>

        <button class="primary-btn" :disabled="claim.claimed" @click="confirmClaim">确认兑奖</button>
      </div>

      <div v-else class="glass-card claim-result empty-state">输入中奖编号后查看核验结果</div>
    </section>
  </AdminShell>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../api'
import AdminShell from '../../components/AdminShell.vue'

const raffleNo = ref('')
const claim = ref(null)

async function verify() {
  const { data } = await api.post('/admin/claims/verify', { raffleNo: raffleNo.value })
  claim.value = data
}

async function confirmClaim() {
  await api.post('/admin/claims/confirm', { winnerId: claim.value.winner_id })
  await verify()
}
</script>
