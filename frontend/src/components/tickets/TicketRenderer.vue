<template>
  <component :is="component" v-bind="ticketProps" />
</template>

<script setup>
import { computed } from 'vue'
import ThemeAurora from './themes/ThemeAurora.vue'
import ThemeRetro from './themes/ThemeRetro.vue'
import ThemeMinimal from './themes/ThemeMinimal.vue'
import ThemeFestival from './themes/ThemeFestival.vue'
import ThemeBlueprint from './themes/ThemeBlueprint.vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'aurora',
  },
  raffleNo: {
    type: String,
    required: true,
  },
  studentNo: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  badge: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  alreadyRegistered: {
    type: Boolean,
    default: false,
  },
  showStudentNo: {
    type: Boolean,
    default: false,
  },
})

const themes = {
  aurora: ThemeAurora,
  retro: ThemeRetro,
  minimal: ThemeMinimal,
  festival: ThemeFestival,
  blueprint: ThemeBlueprint,
}

const component = computed(() => themes[props.theme] || ThemeAurora)
const ticketProps = computed(() => props)
</script>
