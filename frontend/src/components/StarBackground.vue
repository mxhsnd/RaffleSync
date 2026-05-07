<template>
  <div class="starfield" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const container = ref(null)
let animationFrameId = null

onMounted(() => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  container.value.appendChild(canvas)

  let width = container.value.clientWidth
  let height = container.value.clientHeight
  canvas.width = width
  canvas.height = height

  const stars = []
  const numStars = 150

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      vx: Math.floor(Math.random() * 50) - 25,
      vy: Math.floor(Math.random() * 50) - 25,
      opacity: Math.random()
    })
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'lighter'

    for (let i = 0, x = stars.length; i < x; i++) {
      const s = stars[i]
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI)
      ctx.fill()

      s.x += s.vx / 30
      s.y += s.vy / 30

      if (s.x < 0 || s.x > width) s.vx = -s.vx
      if (s.y < 0 || s.y > height) s.vy = -s.vy

      s.opacity += (Math.random() - 0.5) * 0.05
      if(s.opacity < 0.1) s.opacity = 0.1
      if(s.opacity > 0.9) s.opacity = 0.9
    }

    // Draw connecting lines
    ctx.lineWidth = 0.5
    for (let i = 0, x = stars.length; i < x; i++) {
      for (let j = i + 1; j < x; j++) {
        const dx = stars[i].x - stars[j].x
        const dy = stars[i].y - stars[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          ctx.strokeStyle = `rgba(124, 77, 255, ${1 - dist / 100})`
          ctx.beginPath()
          ctx.moveTo(stars[i].x, stars[i].y)
          ctx.lineTo(stars[j].x, stars[j].y)
          ctx.stroke()
        }
      }
    }

    animationFrameId = requestAnimationFrame(draw)
  }

  draw()

  const handleResize = () => {
    width = container.value.clientWidth
    height = container.value.clientHeight
    canvas.width = width
    canvas.height = height
  }
  window.addEventListener('resize', handleResize)

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', handleResize)
  })
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
  background: radial-gradient(circle at center, #1a103c 0%, #0a0b10 100%);
  pointer-events: none;
}
</style>
