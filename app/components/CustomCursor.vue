<script setup lang="ts">
import gsap from 'gsap'

const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const hovering = ref(false)
const visible = ref(false)

let xTo: gsap.QuickToFunc
let yTo: gsap.QuickToFunc
let rxTo: gsap.QuickToFunc
let ryTo: gsap.QuickToFunc

function onMove(e: MouseEvent) {
  visible.value = true
  xTo?.(e.clientX)
  yTo?.(e.clientY)
  rxTo?.(e.clientX)
  ryTo?.(e.clientY)

  const el = (e.target as HTMLElement)?.closest(
    'a, button, [data-cursor="hover"]',
  )
  hovering.value = !!el
}

function onLeave() {
  visible.value = false
}

onMounted(async () => {
  // Touch / reduced-motion users keep the native cursor — bail before
  // hiding it, so we never strand them with no pointer at all.
  if (window.matchMedia('(pointer: coarse)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Ensure the refs exist before wiring GSAP to them.
  await nextTick()
  if (!dot.value || !ring.value) return

  xTo = gsap.quickTo(dot.value, 'x', { duration: 0.08, ease: 'power3' })
  yTo = gsap.quickTo(dot.value, 'y', { duration: 0.08, ease: 'power3' })
  rxTo = gsap.quickTo(ring.value, 'x', { duration: 0.4, ease: 'power3' })
  ryTo = gsap.quickTo(ring.value, 'y', { duration: 0.4, ease: 'power3' })

  // Only hide the native cursor once ours is actually live.
  document.documentElement.classList.add('has-custom-cursor')

  window.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('has-custom-cursor')
  window.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-[100] hidden md:block"
    :style="{ opacity: visible ? 1 : 0 }"
  >
    <div
      ref="ring"
      class="absolute left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border border-ink/30 transition-[width,height,margin,background-color,border-color] duration-300 ease-out"
      :class="
        hovering ? '!h-16 !w-16 -ml-8 -mt-8 border-transparent bg-brand/10' : ''
      "
    />
    <div
      ref="dot"
      class="absolute left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-ink transition-[scale] duration-300"
      :class="hovering ? 'scale-0' : 'scale-100'"
    />
  </div>
</template>
