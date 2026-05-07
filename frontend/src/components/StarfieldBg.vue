<template>
  <div class="starfield-bg">
    <canvas ref="canvas"></canvas>
    <div class="ambient-light"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref(null)
let ctx = null
let animationFrameId = null
let stars = []

const initStars = (width, height) => {
  stars = []
  const numStars = Math.floor((width * height) / 1500)
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      vx: Math.floor(Math.random() * 50) - 25,
      vy: Math.floor(Math.random() * 50) - 25,
      alpha: Math.random(),
      alphaChange: (Math.random() * 0.02) - 0.01
    })
  }
}

const draw = () => {
  if (!canvas.value) return

  const width = canvas.value.width
  const height = canvas.value.height

  ctx.clearRect(0, 0, width, height)

  stars.forEach(star => {
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`
    ctx.fill()

    // 更新位置 (极缓慢移动)
    star.x += star.vx * 0.005
    star.y += star.vy * 0.005

    // 边界处理
    if (star.x < 0 || star.x > width) star.vx = -star.vx
    if (star.y < 0 || star.y > height) star.vy = -star.vy

    // 闪烁效果
    star.alpha += star.alphaChange
    if (star.alpha > 1 || star.alpha < 0) {
      star.alphaChange = -star.alphaChange
    }
  })

  animationFrameId = requestAnimationFrame(draw)
}

const resize = () => {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  initStars(canvas.value.width, canvas.value.height)
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    resize()
    window.addEventListener('resize', resize)
    draw()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.starfield-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background-color: var(--bg-color);
  overflow: hidden;
  pointer-events: none;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.ambient-light {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 80vh;
  background: radial-gradient(
    circle,
    rgba(124, 77, 255, 0.15) 0%,
    rgba(0, 229, 255, 0.05) 50%,
    rgba(10, 11, 16, 0) 80%
  );
  filter: blur(60px);
  z-index: 1;
}
</style>
