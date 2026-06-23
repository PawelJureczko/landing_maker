<script setup lang="ts">
const root = ref<HTMLElement | null>(null)
useReveal(root, { childSelector: '[data-cta-fade]', y: 40, stagger: 0.1 })

const form = reactive({
  imie: '',
  kontakt: '',
  branza: '',
  firma: '',
  wiadomosc: '',
})
const submitted = ref(false)
const tried = ref(false)

const valid = computed(
  () => form.imie.trim() && form.kontakt.trim() && form.branza,
)

function submit() {
  tried.value = true
  if (!valid.value) return
  // TODO: podłączyć realną wysyłkę (np. Formspree / server route → mail)
  submitted.value = true
}

const branze = [
  'Barber',
  'Fryzjer',
  'Salon kosmetyczny',
  'Mechanik',
  'Kwiaciarnia',
  'Restauracja / gastronomia',
  'Siłownia / fitness',
  'Inna',
]

const reassurances = [
  'Darmowy projekt Twojej strony',
  '2 rundy poprawek w cenie',
  'Płacisz dopiero, gdy się spodoba',
  'Odezwiemy się w ciągu 24 godzin',
]

const inputClass =
  'w-full rounded-xl border bg-white/5 px-4 py-3 text-panel-fg placeholder:text-panel-fg/40 outline-none transition-colors focus-visible:border-brand'
</script>

<template>
  <section id="kontakt" ref="root" class="relative scroll-mt-24 px-6 py-12 md:py-32">
    <div
      class="theme-fade relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-line bg-panel px-6 py-12 text-panel-fg md:px-12 md:py-16"
    >
      <AuroraBackground :intensity="0.45" />
      <div class="relative z-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <!-- left: pitch -->
        <div>
          <h2
            data-cta-fade
            class="display text-balance text-[clamp(2rem,5vw,3.5rem)]"
          >
            Zobaczmy, jak wyglądałaby
            <span class="text-gradient font-serif italic">Twoja strona.</span>
          </h2>
          <p data-cta-fade class="mt-5 max-w-md text-lg text-panel-fg/70">
            Wypełnij formularz - przygotujemy darmowy projekt pod Twoją firmę.
            Bez opłat z góry, bez zobowiązań.
          </p>
          <ul data-cta-fade class="mt-8 space-y-3">
            <li
              v-for="r in reassurances"
              :key="r"
              class="flex items-center gap-3 text-sm text-panel-fg/90"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/25 text-brand-4">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 6.5 5 9l4.5-5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              {{ r }}
            </li>
          </ul>
        </div>

        <!-- right: form -->
        <div data-cta-fade>
          <Transition name="cta-form" mode="out-in">
            <!-- success -->
            <div
              v-if="submitted"
              key="ok"
              class="flex h-full flex-col items-center justify-center rounded-2xl border border-panel-fg/10 bg-white/5 p-10 text-center"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#28c840] text-white">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <h3 class="mt-5 text-xl font-bold">Dziękujemy, {{ form.imie }}!</h3>
              <p class="mt-2 max-w-xs text-sm text-panel-fg/70">
                Odezwiemy się w ciągu 24 godzin z darmowym projektem Twojej strony.
              </p>
            </div>

            <!-- form -->
            <form v-else key="form" novalidate class="space-y-4" @submit.prevent="submit">
              <div>
                <label for="f-imie" class="mb-1.5 block text-sm text-panel-fg/70">Imię *</label>
                <input id="f-imie" v-model="form.imie" type="text" placeholder="Jak się do Ciebie zwracać?"
                  :class="[inputClass, tried && !form.imie.trim() ? 'border-red-400' : 'border-panel-fg/15']" />
              </div>

              <div>
                <label for="f-kontakt" class="mb-1.5 block text-sm text-panel-fg/70">Telefon lub e-mail *</label>
                <input id="f-kontakt" v-model="form.kontakt" type="text" placeholder="Jak mamy się odezwać?"
                  :class="[inputClass, tried && !form.kontakt.trim() ? 'border-red-400' : 'border-panel-fg/15']" />
              </div>

              <div>
                <label for="f-branza" class="mb-1.5 block text-sm text-panel-fg/70">Branża *</label>
                <select id="f-branza" v-model="form.branza"
                  :class="[inputClass, tried && !form.branza ? 'border-red-400' : 'border-panel-fg/15']">
                  <option value="">- wybierz -</option>
                  <option v-for="b in branze" :key="b" :value="b">{{ b }}</option>
                </select>
              </div>

              <div>
                <label for="f-firma" class="mb-1.5 block text-sm text-panel-fg/70">Nazwa firmy</label>
                <input id="f-firma" v-model="form.firma" type="text" placeholder="np. Razor Sznyt"
                  :class="[inputClass, 'border-panel-fg/15']" />
              </div>

              <div>
                <label for="f-wiad" class="mb-1.5 block text-sm text-panel-fg/70">Coś jeszcze? (opcjonalnie)</label>
                <textarea id="f-wiad" v-model="form.wiadomosc" rows="2" placeholder="np. mam już logo i zdjęcia"
                  :class="[inputClass, 'resize-none border-panel-fg/15']" />
              </div>

              <button
                type="submit"
                data-cursor="hover"
                class="w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.02] active:scale-95"
              >
                Odbieram darmowy projekt
              </button>
              <p v-if="tried && !valid" class="text-center text-xs text-red-400">
                Uzupełnij imię, kontakt i branżę.
              </p>
              <p v-else class="text-center text-xs text-panel-fg/50">
                Odpowiadamy w 24h · Twoje dane trafią tylko do nas
              </p>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-form-enter-active,
.cta-form-leave-active {
  transition: all 0.35s var(--ease-out-expo);
}
.cta-form-enter-from,
.cta-form-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
