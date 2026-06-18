<script setup lang="ts">
const props = withDefaults(
  defineProps<{ variant?: 'primary' | 'ghost'; strength?: number }>(),
  { variant: 'primary', strength: 0.45 },
)

const el = ref<HTMLElement | null>(null)
const label = ref<HTMLElement | null>(null)
// the button drifts toward the cursor; its label drifts about half as much
// for a subtle parallax/depth effect
useMagnetic(el, props.strength)
useMagnetic(label, props.strength * 0.45)
</script>

<template>
  <button
    ref="el"
    data-cursor="hover"
    class="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold transition-colors duration-300 will-change-transform"
    :class="
      variant === 'primary'
        ? 'bg-ink text-paper'
        : 'border border-line bg-paper/60 text-ink backdrop-blur'
    "
  >
    <span
      v-if="variant === 'primary'"
      class="absolute inset-0 -z-0 bg-gradient-to-r from-brand via-brand-2 to-brand-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    />
    <span ref="label" class="relative z-10 flex items-center gap-2">
      <slot />
    </span>
  </button>
</template>
