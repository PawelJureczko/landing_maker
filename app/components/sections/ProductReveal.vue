<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const root = ref<HTMLElement | null>(null)
const active = ref(0)
const pinned = ref(false)

const steps = [
  {
    k: '01',
    title: 'Wypełnij formularz',
    body: 'Krótki formularz o Twojej firmie — branża, nazwa, co oferujesz. Zajmie Ci dwie minuty.',
  },
  {
    k: '02',
    title: 'Dostajesz darmowy projekt',
    body: 'Na jego podstawie przygotowujemy gotowy projekt Twojej strony. Bez opłat z góry, bez zobowiązań.',
  },
  {
    k: '03',
    title: 'Poprawiamy do skutku',
    body: 'Coś nie gra? Masz dwie darmowe rundy poprawek — dopracowujemy stronę, aż będzie dokładnie taka, jak chcesz.',
  },
  {
    k: '04',
    title: 'Decydujesz',
    body: 'Podoba się? Publikujemy i strona rusza. Nie? Nie płacisz ani złotówki.',
  },
]

let ctx: gsap.Context | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  // Below lg, or on touch / reduced-motion, we don't pin: show the fully
  // built page and every step's copy as a normal stacked section.
  const canPin = window.matchMedia('(min-width: 1024px)').matches && !reduced && !coarse

  if (!canPin) {
    active.value = steps.length - 1
    return
  }

  pinned.value = true
  ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: root.value,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        active.value = Math.min(
          steps.length - 1,
          Math.floor(self.progress * steps.length),
        )
      },
    })
  }, root.value!)
})

onBeforeUnmount(() => ctx?.revert())

// a step's copy shows when it's active, or always when not pinned
const showBody = (i: number) => !pinned.value || active.value === i

// progressive build state for the mockup
const showNav = computed(() => active.value >= 0)
const showHero = computed(() => active.value >= 1)
const showCta = computed(() => active.value >= 1)
const showFeatures = computed(() => active.value >= 2)
const published = computed(() => active.value >= 3)
const accents = ['#6d5efc', '#a855f7', '#ec4899', '#38bdf8']
const accent = computed(() => accents[active.value] ?? '#6d5efc')
</script>

<template>
  <section id="how" ref="root" class="relative scroll-mt-24 bg-paper lg:h-[400vh]">
    <div
      class="flex items-center overflow-visible py-12 lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:py-0"
    >
      <div
        class="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-2"
      >
        <!-- left: narrative -->
        <div>
          <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Jak to działa
          </p>
          <h2 class="display mb-10 text-[clamp(2rem,4.5vw,3.5rem)] text-ink">
            Od formularza<br />do gotowej strony.
          </h2>

          <ul class="space-y-1">
            <li
              v-for="(s, i) in steps"
              :key="s.k"
              class="flex min-h-[120px] flex-col justify-start border-l-2 py-4 pl-6 transition-[border-color,opacity] duration-500"
              :class="
                !pinned || active === i ? 'border-brand' : 'border-line opacity-40'
              "
            >
              <div class="flex items-baseline gap-3">
                <span
                  class="font-mono text-xs"
                  :class="!pinned || active === i ? 'text-brand' : 'text-muted'"
                  >{{ s.k }}</span
                >
                <h3 class="text-xl font-bold text-ink">{{ s.title }}</h3>
              </div>
              <Transition name="step">
                <p v-if="showBody(i)" class="mt-2 max-w-md text-muted">
                  {{ s.body }}
                </p>
              </Transition>
            </li>
          </ul>
        </div>

        <!-- right: progressively built mockup -->
        <div class="relative [perspective:1400px]" aria-hidden="true">
          <div
            class="relative rounded-2xl border border-line bg-paper shadow-[0_40px_100px_-30px_rgba(40,30,90,0.4)] transition-transform duration-700"
            :style="{ transform: `rotateY(${published ? 0 : -6}deg) rotateX(2deg)` }"
          >
            <div class="flex items-center gap-2 border-b border-line bg-paper-soft px-4 py-3">
              <span class="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span class="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span class="h-3 w-3 rounded-full bg-[#28c840]" />
              <div
                class="ml-3 flex-1 rounded-md bg-line/60 px-3 py-1 text-center text-xs text-muted transition-colors"
              >
                {{ published ? '🔒 twojafirma.pl · online' : 'twojafirma.pl/projekt' }}
              </div>
            </div>

            <div class="h-[clamp(300px,42vh,380px)] space-y-5 overflow-hidden p-6">
              <Transition name="rise">
                <div v-if="showNav" class="flex items-center justify-between">
                  <div class="h-3 w-16 rounded-full bg-line" />
                  <div class="flex items-center gap-2">
                    <div class="h-3 w-10 rounded-full bg-line" />
                    <div class="h-6 w-16 rounded-full transition-colors" :style="{ background: accent }" />
                  </div>
                </div>
              </Transition>

              <Transition name="rise">
                <div v-if="showHero" class="space-y-2 pt-6">
                  <div class="h-7 w-4/5 rounded-md bg-ink/80" />
                  <div class="h-7 w-1/2 rounded-md bg-ink/40" />
                  <div class="h-3 w-2/3 rounded-full bg-line" />
                </div>
              </Transition>

              <Transition name="rise">
                <div v-if="showCta" class="flex gap-3">
                  <div class="h-9 w-32 rounded-lg transition-colors" :style="{ background: accent }" />
                  <div class="h-9 w-24 rounded-lg border border-line" />
                </div>
              </Transition>

              <Transition name="rise">
                <div v-if="showFeatures" class="grid grid-cols-3 gap-3 pt-2">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="space-y-2 rounded-xl border border-line p-3"
                  >
                    <div
                      class="h-7 w-7 rounded-lg transition-colors"
                      :style="{ background: accent, opacity: 0.18 }"
                    />
                    <div class="h-2.5 w-full rounded-full bg-line" />
                    <div class="h-2.5 w-2/3 rounded-full bg-line" />
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- published badge -->
          <Transition name="pop">
            <div
              v-if="published"
              class="absolute -right-3 -top-3 rounded-full bg-[#28c840] px-3 py-1.5 text-xs font-bold text-white shadow-lg"
            >
              ✓ Online
            </div>
          </Transition>

          <div class="absolute -inset-x-6 -bottom-8 -z-10 h-32 rounded-full blur-3xl transition-colors" :style="{ background: accent, opacity: 0.18 }" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.step-enter-active,
.rise-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.pop-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
</style>
