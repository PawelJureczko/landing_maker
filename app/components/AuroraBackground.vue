<script setup lang="ts">
/**
 * Soft animated aurora / mesh gradient. Three blurred blobs drift on
 * independent loops. Purely decorative, sits behind content.
 */
withDefaults(defineProps<{ intensity?: number }>(), { intensity: 1 })
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    :style="{ opacity: intensity }"
    aria-hidden="true"
  >
    <div class="aurora-blob blob-1" />
    <div class="aurora-blob blob-2" />
    <div class="aurora-blob blob-3" />
  </div>
</template>

<style scoped>
.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
  mix-blend-mode: multiply;
}

.blob-1 {
  width: 46vw;
  height: 46vw;
  top: -10%;
  left: -5%;
  background: radial-gradient(circle at 30% 30%, #8b7bff, transparent 70%);
  animation: drift-1 18s ease-in-out infinite;
}
.blob-2 {
  width: 40vw;
  height: 40vw;
  top: 5%;
  right: -8%;
  background: radial-gradient(circle at 70% 40%, #f0abfc, transparent 70%);
  animation: drift-2 22s ease-in-out infinite;
}
.blob-3 {
  width: 38vw;
  height: 38vw;
  bottom: -15%;
  left: 25%;
  background: radial-gradient(circle at 50% 50%, #7dd3fc, transparent 70%);
  animation: drift-3 26s ease-in-out infinite;
}

@keyframes drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(12%, 18%) scale(1.15); }
}
@keyframes drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-14%, 22%) scale(1.1); }
}
@keyframes drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1.05); }
  50% { transform: translate(10%, -16%) scale(0.92); }
}

/* On dark backgrounds `multiply` wipes the blobs out. Use `normal` so they
   read as soft glows. NB: do NOT use `screen` here — combined with the large
   blur it pushes Chromium into compositing the whole section as one low-res
   (blurry) layer. `normal` keeps everything crisp. */
:global(html.dark) .aurora-blob {
  mix-blend-mode: normal;
  opacity: 0.65;
}

@media (prefers-reduced-motion: reduce) {
  .aurora-blob { animation: none; }
}
</style>
