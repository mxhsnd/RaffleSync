<template>
  <div class="app-shell">
    <BackgroundFX />
    <main class="app-stage">
      <router-view />
    </main>
    <div class="app-version">v{{ appVersion }}</div>
  </div>
</template>

<script setup>
import BackgroundFX from './components/BackgroundFX.vue'

const appVersion = import.meta.env.PACKAGE_VERSION || '0.0.0'
</script>
