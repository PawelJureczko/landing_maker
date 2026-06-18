<script setup lang="ts">
withDefaults(
  defineProps<{ icon: string; title: string; body: string; wide?: boolean }>(),
  { wide: false },
)

const card = ref<HTMLElement | null>(null)
useTilt(card, 6)

const paths: Record<string, string> = {
  bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  wand: 'M15 4V2m0 20v-2m5-5h2M3 9h2m11.5-5.5L18 5M6 18l1.5-1.5M3 21 14 10m3-3 1.5-1.5',
  chart: 'M4 20V10m6 10V4m6 16v-7M3 20h18',
  lock: 'M6 10V7a6 6 0 0 1 12 0v3m-13 0h14v11H5V10Z',
  forms: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3',
}
</script>

<template>
  <article
    ref="card"
    data-card
    data-cursor="hover"
    class="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-paper p-7 transition-all duration-500 hover:border-brand/40 hover:shadow-[0_24px_50px_-30px_rgba(109,94,252,0.55)] will-change-transform"
    :class="wide ? 'md:col-span-2' : ''"
  >
    <div
      class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
    />
    <div
      class="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-paper-soft text-brand transition-colors duration-500 group-hover:border-brand/40 group-hover:bg-brand/5"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          :d="paths[icon]"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="relative z-10 mt-6">
      <h3 class="text-lg font-bold text-ink">{{ title }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted">{{ body }}</p>
    </div>
  </article>
</template>
