<script setup lang="ts">
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)
const headline = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const mockup = ref<HTMLElement | null>(null)
const mockupInner = ref<HTMLElement | null>(null)
const cue = ref<HTMLElement | null>(null)

useTilt(mockupInner, 8)
const scrollTo = useScrollTo()

const line1 = ['Zobacz', 'swoją', 'nową', 'stronę']
const line2 = ['za', 'darmo.']

let ctx: gsap.Context | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  ctx = gsap.context(() => {
    const words = headline.value?.querySelectorAll('.word > span')
    const meta = root.value?.querySelectorAll('[data-hero-fade]')
    // reveal the wrappers that CSS hid pre-JS (.hero-anim)
    const wrappers = [content.value, mockup.value, cue.value]

    if (reduced) {
      gsap.set(wrappers, { opacity: 1 })
      gsap.set([words!, meta!], { y: 0, opacity: 1, yPercent: 0 })
      gsap.set(mockup.value, { opacity: 1, y: 0 })
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    // wrappers become visible; their children stay hidden via the from() below,
    // so nothing flashes
    tl.set(wrappers, { opacity: 1 })
      .from(words!, { yPercent: 120, duration: 1.1, stagger: 0.06 })
      .from(
        meta!,
        { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 },
        '-=0.7',
      )
      .from(
        mockup.value,
        { y: 80, opacity: 0, scale: 0.96, duration: 1.3 },
        '-=0.9',
      )

    // parallax on scroll
    gsap.to(mockup.value, {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
    // subtle upward drift on scroll — NO opacity fade (it made the white
    // headline read as washed-out gray in dark mode)
    gsap.to(headline.value, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, root.value!)
})

onBeforeUnmount(() => {
  // revert() kills only this context's tweens + ScrollTriggers
  ctx?.revert()
})
</script>

<template>
  <section
    id="top"
    ref="root"
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-28"
  >
    <AuroraBackground :intensity="0.55" />

    <!-- subtle grid -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
      aria-hidden="true"
      style="
        background-image: linear-gradient(var(--color-ink) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-ink) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse 70% 60% at 50% 35%, #000, transparent);
      "
    />

    <div ref="content" class="hero-anim relative z-10 mx-auto max-w-5xl text-center">
      <div
        data-hero-fade
        class="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"
          />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-brand" />
        </span>
        Darmowy projekt strony - dla lokalnych firm w całej Polsce
      </div>

      <h1
        ref="headline"
        class="display text-balance text-[clamp(2.75rem,8vw,7rem)] text-ink"
      >
        <span class="reveal-line">
          <span
            v-for="(w, i) in line1"
            :key="`a${i}`"
            class="word inline-block overflow-hidden"
            ><span class="inline-block">{{ w }}&nbsp;</span></span
          >
        </span>
        <span class="reveal-line">
          <span
            v-for="(w, i) in line2"
            :key="`b${i}`"
            class="word inline-block overflow-hidden"
            ><span class="inline-block text-gradient italic font-serif"
              >{{ w }}&nbsp;</span
            ></span
          >
        </span>
      </h1>

      <p
        data-hero-fade
        class="mx-auto mt-6 text-balance text-xl font-bold text-ink md:text-2xl"
      >
        Płacisz, dopiero gdy Ci się spodoba.
      </p>

      <p
        data-hero-fade
        class="mx-auto mt-5 max-w-xl text-balance text-lg text-muted md:text-xl"
      >
        Tworzymy proste, dopracowane strony dla fryzjerów, mechaników,
        kwiaciarni i innych lokalnych firm. Wypełnij krótki formularz, a my
        przygotujemy <span class="text-ink">gotowy projekt Twojej strony</span> -
        bez opłat z góry, bez zobowiązań. Strona, która realnie przyciąga nowych
        klientów.
      </p>

      <div
        data-hero-fade
        class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <MagneticButton variant="primary" @click="scrollTo('#pricing')">
          Odbierz darmowy projekt
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </MagneticButton>
        <MagneticButton variant="ghost" @click="scrollTo('#templates')">
          Zobacz przykłady
        </MagneticButton>
      </div>

      <p data-hero-fade class="mt-5 text-xs text-muted">
        Darmowy projekt · 2 rundy poprawek · Płacisz dopiero, gdy zdecydujesz
      </p>
    </div>

    <!-- floating product mockup -->
    <div
      ref="mockup"
      class="hero-anim relative z-10 mt-16 w-full max-w-3xl px-2 [perspective:1200px]"
      aria-hidden="true"
    >
      <div ref="mockupInner" class="will-change-transform">
        <BrowserMockup />
      </div>
      <div
        class="absolute -inset-x-10 -bottom-10 -z-10 h-40 rounded-full bg-brand/20 blur-3xl"
      />
    </div>

    <!-- scroll cue -->
    <div
      ref="cue"
      aria-hidden="true"
      class="hero-anim absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted md:flex"
    >
      <span class="text-[11px] uppercase tracking-[0.2em]">Scroll</span>
      <span class="h-10 w-px animate-pulse bg-gradient-to-b from-ink/40 to-transparent" />
    </div>
  </section>
</template>
