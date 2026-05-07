<template>
  <section class="ticket-theme ticket-theme-retro">
    <div class="retro-board">
      <div class="retro-stamp">ENTRY</div>
      <p class="ticket-kicker">{{ badge || 'Retro Ticket' }}</p>
      <h1>{{ title }}</h1>
      <p class="ticket-copy">{{ subtitle }}</p>
      <div class="retro-divider"></div>
      <div class="retro-number-block">
        <span>Raffle No.</span>
        <strong>{{ raffleNo }}</strong>
      </div>
      <div class="retro-meta">
        <span>{{ hint }}</span>
        <span v-if="showStudentNo">{{ studentNo }}</span>
        <span>{{ alreadyRegistered ? 'Duplicate Return' : 'Fresh Print' }}</span>
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
