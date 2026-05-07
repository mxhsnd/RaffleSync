<template>
  <section class="ticket-theme ticket-theme-festival">
    <div class="festival-shell">
      <div class="festival-ribbons">
        <span></span><span></span><span></span>
      </div>
      <div class="festival-main">
        <p class="ticket-kicker">{{ badge || 'Festival Drop' }}</p>
        <h1>{{ title }}</h1>
        <p class="ticket-copy">{{ subtitle }}</p>
        <div class="festival-number">{{ raffleNo }}</div>
        <div class="festival-tags">
          <span>{{ hint }}</span>
          <span>{{ alreadyRegistered ? '已回传' : '新票据' }}</span>
          <span v-if="showStudentNo">{{ studentNo }}</span>
        </div>
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
