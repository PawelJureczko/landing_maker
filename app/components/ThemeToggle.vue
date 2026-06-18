<script setup lang="ts">
/**
 * Light/dark toggle. The initial theme class is applied pre-paint by the
 * inline head script (see nuxt.config), so this component only handles the
 * click → flip + persist. Icons are swapped via the CSS `dark:` variant,
 * not JS state, to avoid any hydration mismatch.
 */
const STORAGE_KEY = 'plume-theme'

function toggle() {
  const el = document.documentElement
  const next = !el.classList.contains('dark')
  el.classList.toggle('dark', next)
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  } catch {
    /* storage unavailable — toggle still works for the session */
  }
}
</script>

<template>
  <button
    data-cursor="hover"
    aria-label="Toggle light and dark theme"
    class="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brand/40 hover:text-brand"
    @click="toggle"
  >
    <!-- moon: shown in light mode (click → go dark) -->
    <svg
      class="h-[18px] w-[18px] dark:hidden"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
    <!-- sun: shown in dark mode (click → go light) -->
    <svg
      class="hidden h-[18px] w-[18px] dark:block"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" />
      <path
        d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
  </button>
</template>
