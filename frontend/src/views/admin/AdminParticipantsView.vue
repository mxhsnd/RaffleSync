<template>
  <AdminShell eyebrow="Participants" title="报名名单" description="查看所有登记参与者及其核验信息。">
    <section class="glass-card table-card table-shell">
      <div class="table-toolbar">
        <div>
          <p class="kicker">Roster</p>
          <h2>参与者列表</h2>
        </div>
        <span class="status-pill">共 {{ participants.length }} 人</span>
      </div>

      <table class="data-table" v-if="participants.length">
        <thead>
          <tr>
            <th>编号</th>
            <th>昵称</th>
            <th>学号</th>
            <th>姓名</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="participant in participants" :key="participant.id">
            <td>{{ participant.raffle_no }}</td>
            <td>{{ participant.nickname }}</td>
            <td>{{ participant.student_no }}</td>
            <td>{{ participant.real_name }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">暂无报名数据</div>
    </section>
  </AdminShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../api'
import AdminShell from '../../components/AdminShell.vue'

const participants = ref([])

onMounted(async () => {
  const { data } = await api.get('/admin/participants')
  participants.value = data
})
</script>
