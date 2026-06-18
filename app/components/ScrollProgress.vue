<script setup lang="ts">
const progress = ref(0)

function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? (h.scrollTop / max) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="fixed left-0 right-0 top-0 z-[90] h-[3px] bg-transparent">
    <div
      class="h-full origin-left bg-gradient-to-r from-brand via-brand-2 to-brand-3"
      :style="{ transform: `scaleX(${progress / 100})` }"
    />
  </div>
</template>
