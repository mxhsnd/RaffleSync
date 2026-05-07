<template>
  <div class="admin-shell view-shell">
    <AdminNav />

    <section class="admin-main">
      <header class="admin-topbar">
        <div class="section-heading">
          <span class="kicker">{{ eyebrow }}</span>
          <h1>{{ title }}</h1>
          <p class="muted">{{ description }}</p>
        </div>
        <slot name="actions" />
      </header>

      <div class="admin-panel-stack">
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup>
import AdminNav from './AdminNav.vue'

defineProps({
  eyebrow: {
    type: String,
    default: 'Admin',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
