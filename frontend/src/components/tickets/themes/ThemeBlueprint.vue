<template>
  <section class="ticket-theme ticket-theme-blueprint">
    <div class="blueprint-card">
      <div class="blueprint-grid"></div>
      <div class="blueprint-header">
        <div>
          <p class="ticket-kicker">{{ badge || 'Blueprint Spec' }}</p>
          <h1>{{ title }}</h1>
        </div>
        <span class="blueprint-code">{{ raffleNo.slice(-4) }}</span>
      </div>
      <p class="ticket-copy">{{ subtitle }}</p>
      <div class="blueprint-number">{{ raffleNo }}</div>
      <div class="blueprint-specs">
        <article>
          <span>Status</span>
          <strong>{{ alreadyRegistered ? 'RESTORED' : 'ACTIVE' }}</strong>
        </article>
        <article>
          <span>Rule</span>
          <strong>{{ hint }}</strong>
        </article>
        <article v-if="showStudentNo">
          <span>Student</span>
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
