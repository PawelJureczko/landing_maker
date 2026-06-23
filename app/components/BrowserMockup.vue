<script setup lang="ts">
withDefaults(
  defineProps<{ url?: string; accent?: string }>(),
  { url: 'twojafirma.pl', accent: '#6d5efc' },
)
</script>

<template>
  <div
    aria-hidden="true"
    class="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_30px_80px_-20px_rgba(40,30,90,0.35)]"
  >
    <!-- chrome -->
    <div class="flex items-center gap-2 border-b border-line bg-paper-soft px-4 py-3">
      <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span class="h-3 w-3 rounded-full bg-[#28c840]" />
      <div
        class="ml-3 flex-1 truncate rounded-md bg-line/60 px-3 py-1 text-center text-xs text-muted"
      >
        {{ url }}
      </div>
    </div>

    <!-- fake landing content (placeholders) -->
    <div class="space-y-5 p-6">
      <div class="flex items-center justify-between">
        <div class="h-3 w-16 rounded-full bg-line" />
        <div class="flex gap-2">
          <div class="h-3 w-10 rounded-full bg-line" />
          <div class="h-3 w-10 rounded-full bg-line" />
          <div class="h-6 w-16 rounded-full" :style="{ background: accent }" />
        </div>
      </div>

      <div class="space-y-2 pt-4">
        <div class="h-6 w-3/4 rounded-md bg-ink/80" />
        <div class="h-6 w-1/2 rounded-md bg-ink/40" />
        <div class="h-3 w-2/3 rounded-full bg-line" />
        <div class="h-3 w-1/2 rounded-full bg-line" />
      </div>

      <div class="flex gap-3 pt-1">
        <div class="h-8 w-28 rounded-lg" :style="{ background: accent }" />
        <div class="h-8 w-24 rounded-lg border border-line" />
      </div>

      <div class="grid grid-cols-3 gap-3 pt-4">
        <div
          v-for="i in 3"
          :key="i"
          class="space-y-2 rounded-xl border border-line p-3"
        >
          <div class="h-7 w-7 rounded-lg" :style="{ background: accent, opacity: 0.18 }" />
          <div class="h-2.5 w-full rounded-full bg-line" />
          <div class="h-2.5 w-2/3 rounded-full bg-line" />
        </div>
      </div>
    </div>
  </div>
</template>
