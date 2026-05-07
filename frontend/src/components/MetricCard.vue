<template>
  <div class="surface-card metric-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <p v-if="hint" class="muted">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String,
})
</script>
