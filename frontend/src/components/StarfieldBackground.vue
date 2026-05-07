<template>
  <div class="starfield" ref="container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const container = ref(null)
let canvas, ctx, stars = [], animationFrame

onMounted(() => {
  canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')
  container.value.appendChild(canvas)

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initStars()
  }

  const initStars = () => {
    stars = []
    const numStars = Math.floor((canvas.width * canvas.height) / 8000)
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25,
        alpha: Math.random()
      })
    }
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 背景光晕
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2)
    gradient.addColorStop(0, 'rgba(124, 77, 255, 0.15)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0, x = stars.length; i < x; i++) {
      const s = stars[i]

      // 更新位置 (缓慢漂浮)
      s.x += s.vx / 100
      s.y += s.vy / 100

      // 闪烁效果
      s.alpha += (Math.random() - 0.5) * 0.1
      if (s.alpha < 0.1) s.alpha = 0.1
      if (s.alpha > 1) s.alpha = 1

      // 越界重置
      if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx
      if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy

      ctx.beginPath()
      ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`
      ctx.fill()
    }
    animationFrame = requestAnimationFrame(draw)
  }

  window.addEventListener('resize', resize)
  resize()
  draw()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {})
  cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, #1a103c 0%, #0a0b10 100%);
}
</style>
