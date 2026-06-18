<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

const PAD = 24 // matches px-6 on the track

const examples = [
  {
    name: 'Razor Sznyt',
    tag: 'Barber · Knurów',
    accent: '#6d5efc',
    real: true,
    href: 'https://razorsznyt.pl',
    img: '/img/razorsznyt.png',
  },
  { name: 'Kwiaciarnia', tag: 'Przykład', accent: '#ec4899' },
  { name: 'Mechanik', tag: 'Przykład', accent: '#38bdf8' },
  { name: 'Restauracja', tag: 'Przykład', accent: '#f59e0b' },
  { name: 'Salon kosmetyczny', tag: 'Przykład', accent: '#a855f7' },
  { name: 'Siłownia', tag: 'Przykład', accent: '#10b981' },
]

let ctx: gsap.Context | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const wide = window.matchMedia('(min-width: 1024px)').matches
  // Scroll-driven horizontal pin only on a real desktop pointer. Touch /
  // reduced-motion / small screens fall back to native horizontal swiping.
  if (reduced || coarse || !wide || !track.value || !root.value) return

  ctx = gsap.context(() => {
    const distance = () => track.value!.scrollWidth - window.innerWidth + PAD
    gsap.to(track.value, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    })
  }, root.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section
    id="templates"
    ref="root"
    class="relative scroll-mt-24 overflow-hidden bg-paper-soft py-4"
  >
    <div class="flex flex-col justify-center py-10 lg:h-screen lg:py-0">
      <div class="mx-auto mb-10 w-full max-w-6xl px-6">
        <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          Przykłady
        </p>
        <h2 class="display text-[clamp(2rem,5vw,4rem)] text-ink">
          Tak może wyglądać strona Twojej firmy.
        </h2>
      </div>

      <div
        ref="track"
        class="flex gap-6 px-6 will-change-transform max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:scroll-px-6 max-lg:pb-4 [scrollbar-width:none]"
      >
        <article
          v-for="t in examples"
          :key="t.name"
          data-cursor="hover"
          class="group relative w-[78vw] shrink-0 overflow-hidden rounded-3xl border border-line bg-paper p-6 transition-shadow duration-500 hover:shadow-[0_30px_70px_-30px_rgba(40,30,90,0.4)] max-lg:snap-center sm:w-[46vw] lg:w-[34vw]"
        >
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-ink">{{ t.name }}</h3>
                <span
                  v-if="t.real"
                  class="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand"
                  >Realizacja</span
                >
              </div>
              <span class="text-sm text-muted">{{ t.tag }}</span>
            </div>
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-paper transition-opacity duration-500"
              :class="t.real ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
              :style="{ background: t.accent }"
              aria-hidden="true"
            >
              <svg v-if="t.real" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M6 3h7v7M13 3 4 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>

          <!-- real realization: framed live screenshot, whole card links out -->
          <template v-if="t.real">
            <div class="overflow-hidden rounded-xl border border-line">
              <div class="flex items-center gap-1.5 border-b border-line bg-paper-soft px-3 py-2">
                <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div class="ml-2 flex-1 truncate rounded bg-line/60 px-2 py-0.5 text-center text-[11px] text-muted">
                  razorsznyt.pl
                </div>
              </div>
              <img
                :src="t.img"
                :alt="`Strona internetowa ${t.name}, którą stworzyliśmy`"
                class="block aspect-[16/10] w-full object-cover object-top"
                loading="lazy"
              />
            </div>
            <a
              :href="t.href"
              target="_blank"
              rel="noopener"
              :aria-label="`Zobacz na żywo: ${t.name}`"
              class="absolute inset-0 z-10"
            />
          </template>

          <!-- demo example -->
          <BrowserMockup
            v-else
            :url="`twojafirma.pl/${t.name.toLowerCase().replace(/ /g, '-')}`"
            :accent="t.accent"
          />
        </article>
      </div>
    </div>
  </section>
</template>
