<template>
  <div class="public-shell view-shell">
    <div class="page-wrap">
      <header class="public-topbar">
        <div class="brand-mark">
          <strong>{{ brand }}</strong>
        </div>
        <slot name="topbar" />
      </header>

      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  brand: {
    type: String,
    default: 'RaffleSync',
  },
})
</script>
