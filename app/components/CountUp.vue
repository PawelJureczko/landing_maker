<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(
  defineProps<{
    to: number
    decimals?: number
    prefix?: string
    suffix?: string
    duration?: number
  }>(),
  { decimals: 0, prefix: '', suffix: '', duration: 2 },
)

const el = ref<HTMLElement | null>(null)
const display = ref('0')

function format(v: number) {
  const n = v.toFixed(props.decimals)
  // thousands separators
  const [int, dec] = n.split('.')
  const withSep = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return props.prefix + (dec ? `${withSep}.${dec}` : withSep) + props.suffix
}

const obj = { v: 0 }
let io: IntersectionObserver | null = null

onMounted(() => {
  display.value = format(0)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    display.value = format(props.to)
    return
  }

  io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        gsap.to(obj, {
          v: props.to,
          duration: props.duration,
          ease: 'power3.out',
          onUpdate: () => (display.value = format(obj.v)),
        })
        io?.disconnect()
      }
    },
    { threshold: 0.4 },
  )
  if (el.value) io.observe(el.value)
})

onBeforeUnmount(() => {
  io?.disconnect()
  gsap.killTweensOf(obj)
})
</script>

<template>
  <span ref="el">{{ display }}</span>
</template>
