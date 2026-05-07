<template>
  <section class="ticket-theme ticket-theme-minimal">
    <div class="minimal-frame">
      <div class="minimal-topline"></div>
      <p class="ticket-kicker">{{ badge || 'Minimal Code' }}</p>
      <h1>{{ title }}</h1>
      <p class="ticket-copy">{{ subtitle }}</p>
      <div class="minimal-number">{{ raffleNo }}</div>
      <div class="minimal-footer">
        <span>{{ hint }}</span>
        <span v-if="showStudentNo">{{ studentNo }}</span>
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
  showStudentNo: Boolean,
})
</script>
