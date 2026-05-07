<template>
  <section class="ticket-theme ticket-theme-aurora">
    <div class="aurora-card">
      <div class="aurora-orb aurora-orb-left"></div>
      <div class="aurora-orb aurora-orb-right"></div>
      <div class="aurora-head">
        <div>
          <p class="ticket-kicker">{{ badge || 'Aurora Pass' }}</p>
          <h1>{{ title }}</h1>
        </div>
        <span class="aurora-chip">{{ alreadyRegistered ? '已存在' : '已生成' }}</span>
      </div>
      <p class="ticket-copy">{{ subtitle }}</p>
      <div class="aurora-number">{{ raffleNo }}</div>
      <div class="aurora-grid">
        <article>
          <span>风格</span>
          <strong>极光玻璃</strong>
        </article>
        <article>
          <span>用途</span>
          <strong>{{ hint }}</strong>
        </article>
        <article v-if="showStudentNo">
          <span>学号</span>
          <strong>{{ studentNo }}</strong>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  raffleNo: String,
  studentNo: String,
  title: String,
  subtitle: String,
  badge: String,
  hint: String,
  alreadyRegistered: Boolean,
  showStudentNo: Boolean,
})
</script>
