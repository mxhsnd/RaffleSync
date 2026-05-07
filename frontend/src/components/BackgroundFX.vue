<template>
  <div class="ambient-bg">
    <canvas ref="canvas" class="ambient-stars"></canvas>
    <div class="ambient-orb orb-a"></div>
    <div class="ambient-orb orb-b"></div>
    <div class="ambient-orb orb-c"></div>
    <div class="ambient-grid"></div>
    <div class="ambient-rings"></div>
    <div class="ambient-vignette"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref(null)
let animationFrameId = null
let resizeHandler = null

onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  let width = 0
  let height = 0
  let stars = []

  const initStars = () => {
    const count = Math.max(110, Math.floor((width * height) / 9000))
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.25,
      alpha: Math.random() * 0.78 + 0.14,
      pulse: (Math.random() * 0.024 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
      driftX: (Math.random() - 0.5) * 0.22,
      driftY: (Math.random() - 0.5) * 0.2,
      glow: Math.random() > 0.8,
    }))
  }

  resizeHandler = () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.value.width = width
    canvas.value.height = height
    initStars()
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height)

    for (const star of stars) {
      star.x += star.driftX
      star.y += star.driftY
      star.alpha += star.pulse

      if (star.alpha >= 0.98 || star.alpha <= 0.16) star.pulse *= -1
      if (star.x < -8) star.x = width + 8
      if (star.x > width + 8) star.x = -8
      if (star.y < -8) star.y = height + 8
      if (star.y > height + 8) star.y = -8

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = star.glow ? `rgba(149, 203, 255, ${star.alpha})` : `rgba(255,255,255,${star.alpha})`
      ctx.shadowBlur = star.glow ? 18 : 0
      ctx.shadowColor = 'rgba(130, 190, 255, 0.65)'
      ctx.fill()
    }

    ctx.shadowBlur = 0
    animationFrameId = requestAnimationFrame(draw)
  }

  window.addEventListener('resize', resizeHandler)
  resizeHandler()
  draw()
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.ambient-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 50% 0%, rgba(158, 111, 255, 0.22), transparent 24%),
    radial-gradient(circle at 15% 18%, rgba(57, 192, 255, 0.18), transparent 24%),
    radial-gradient(circle at 85% 20%, rgba(171, 121, 255, 0.14), transparent 20%),
    linear-gradient(180deg, #090d19 0%, #070911 48%, #05060b 100%);
}

.ambient-stars,
.ambient-grid,
.ambient-vignette,
.ambient-orb,
.ambient-rings {
  position: absolute;
  inset: 0;
}

.ambient-stars {
  width: 100%;
  height: 100%;
}

.ambient-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.62), transparent 85%);
}

.ambient-rings {
  background:
    radial-gradient(circle at 50% 52%, transparent 0 23%, rgba(142, 164, 255, 0.09) 23.4%, transparent 24%),
    radial-gradient(circle at 50% 52%, transparent 0 36%, rgba(128, 219, 255, 0.06) 36.4%, transparent 37%);
  opacity: 0.9;
  filter: blur(0.2px);
}

.ambient-vignette {
  background:
    radial-gradient(circle at center, transparent 32%, rgba(4, 6, 12, 0.44) 76%),
    linear-gradient(180deg, rgba(7, 10, 18, 0.08), rgba(7, 10, 18, 0.74));
}

.ambient-orb {
  filter: blur(95px);
  opacity: 0.82;
}

.orb-a {
  inset: auto auto -14% -10%;
  width: 40vw;
  height: 40vw;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(89, 132, 255, 0.5), transparent 66%);
}

.orb-b {
  inset: 6% -8% auto auto;
  width: 32vw;
  height: 32vw;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(156, 103, 255, 0.34), transparent 70%);
}

.orb-c {
  inset: 36% auto auto 32%;
  width: 18vw;
  height: 18vw;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(96, 217, 255, 0.2), transparent 72%);
}
</style>
