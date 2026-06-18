<script setup lang="ts">
const root = ref<HTMLElement | null>(null)
useReveal(root, { childSelector: '[data-cfg]', y: 40, stagger: 0.08 })
const scrollTo = useScrollTo()

// Editable prices (zł). One-time = "na start", recurring = "/mc".
const P = {
  baseStart: 499,
  baseMc: 49,
  domenaMc: 7, // ~80 zł/rok, rozłożone w abonamencie
  tresciStart: 300,
  pelnaStart: 400,
  rezerwacjeMc: 20,
}

const domena = ref<'mam' | 'wy'>('mam')
const tresci = ref<'moje' | 'wy'>('moje')
const zakres = ref<'landing' | 'pelna'>('landing')
const rezerwacje = ref(false)
const provider = ref('')

const startTotal = computed(
  () =>
    P.baseStart +
    (tresci.value === 'wy' ? P.tresciStart : 0) +
    (zakres.value === 'pelna' ? P.pelnaStart : 0),
)
const mcTotal = computed(
  () =>
    P.baseMc +
    (domena.value === 'wy' ? P.domenaMc : 0) +
    (rezerwacje.value ? P.rezerwacjeMc : 0),
)

const breakdown = computed(() => {
  const items = [{ label: 'Strona + hosting', start: P.baseStart, mc: P.baseMc }]
  if (zakres.value === 'pelna')
    items.push({ label: 'Pełna strona (podstrony)', start: P.pelnaStart, mc: 0 })
  if (tresci.value === 'wy')
    items.push({ label: 'Teksty i zdjęcia od nas', start: P.tresciStart, mc: 0 })
  if (domena.value === 'wy')
    items.push({ label: 'Domena + odnawianie', start: 0, mc: P.domenaMc })
  if (rezerwacje.value)
    items.push({ label: 'Rezerwacje online', start: 0, mc: P.rezerwacjeMc })
  return items
})
</script>

<template>
  <section
    id="pricing"
    ref="root"
    class="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-12 md:py-32"
  >
    <div class="mb-12 text-center" data-cfg>
      <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-strong">
        Cennik
      </p>
      <h2 class="display text-[clamp(2rem,5vw,4rem)] text-ink">
        Prosto i bez niespodzianek.
      </h2>
      <p class="mx-auto mt-5 max-w-xl text-lg text-muted">
        Poklikaj, czego potrzebujesz — cena policzy się sama. Dokładną, wiążącą
        wycenę dostaniesz razem z darmowym projektem.
      </p>
    </div>

    <div class="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
      <!-- left: configurator -->
      <div data-cfg class="space-y-4">
        <!-- Zakres -->
        <fieldset class="rounded-3xl border border-line bg-paper p-6">
          <legend class="px-1 text-base font-bold text-ink">Czego potrzebujesz?</legend>
          <p class="mt-1 text-sm text-muted">Jedna strona w zupełności wystarcza większości firm.</p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              data-cursor="hover"
              class="rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              :class="zakres === 'landing' ? 'border-brand bg-brand/5 text-ink' : 'border-line text-muted hover:text-ink'"
              @click="zakres = 'landing'"
            >
              <span class="block font-semibold">Jedna strona</span>
              <span class="text-xs text-muted">wszystko na jednej</span>
            </button>
            <button
              type="button"
              data-cursor="hover"
              class="rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              :class="zakres === 'pelna' ? 'border-brand bg-brand/5 text-ink' : 'border-line text-muted hover:text-ink'"
              @click="zakres = 'pelna'"
            >
              <span class="block font-semibold">Pełna strona</span>
              <span class="text-xs text-muted">galeria, cennik, kontakt…</span>
            </button>
          </div>
        </fieldset>

        <!-- Teksty -->
        <fieldset class="rounded-3xl border border-line bg-paper p-6">
          <legend class="px-1 text-base font-bold text-ink">Teksty i zdjęcia</legend>
          <p class="mt-1 text-sm text-muted">Opisy usług, „o nas”, zdjęcia — masz gotowe czy mamy się tym zająć?</p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button type="button" data-cursor="hover"
              class="rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              :class="tresci === 'moje' ? 'border-brand bg-brand/5 text-ink' : 'border-line text-muted hover:text-ink'"
              @click="tresci = 'moje'">
              <span class="block font-semibold">Dostarczę własne</span>
              <span class="text-xs text-muted">mam teksty i zdjęcia</span>
            </button>
            <button type="button" data-cursor="hover"
              class="rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              :class="tresci === 'wy' ? 'border-brand bg-brand/5 text-ink' : 'border-line text-muted hover:text-ink'"
              @click="tresci = 'wy'">
              <span class="block font-semibold">Napiszcie za mnie</span>
              <span class="text-xs text-muted">treści i dobór zdjęć</span>
            </button>
          </div>
        </fieldset>

        <!-- Domena -->
        <fieldset class="rounded-3xl border border-line bg-paper p-6">
          <legend class="px-1 text-base font-bold text-ink">Adres strony</legend>
          <p class="mt-1 text-sm text-muted">Adres, pod którym znajdą Twoją stronę, np. <span class="text-ink">twojafirma.pl</span></p>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <button type="button" data-cursor="hover"
              class="rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              :class="domena === 'mam' ? 'border-brand bg-brand/5 text-ink' : 'border-line text-muted hover:text-ink'"
              @click="domena = 'mam'">
              <span class="block font-semibold">Mam już swój adres</span>
              <span class="text-xs text-muted">podepniemy go</span>
            </button>
            <button type="button" data-cursor="hover"
              class="rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              :class="domena === 'wy' ? 'border-brand bg-brand/5 text-ink' : 'border-line text-muted hover:text-ink'"
              @click="domena = 'wy'">
              <span class="block font-semibold">Załatwcie za mnie</span>
              <span class="text-xs text-muted">rejestracja + odnawianie</span>
            </button>
          </div>
        </fieldset>

        <!-- Rezerwacje -->
        <fieldset class="rounded-3xl border border-line bg-paper p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <legend class="px-1 text-base font-bold text-ink">Rezerwacje online</legend>
              <p class="mt-1 text-sm text-muted">Przycisk do umawiania wizyt wprost ze strony (Booksy, Calendly itp.).</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="rezerwacje"
              :aria-label="rezerwacje ? 'Wyłącz rezerwacje online' : 'Włącz rezerwacje online'"
              data-cursor="hover"
              class="relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors"
              :class="rezerwacje ? 'bg-brand' : 'bg-line'"
              @click="rezerwacje = !rezerwacje"
            >
              <span class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all" :class="rezerwacje ? 'left-6' : 'left-1'" />
            </button>
          </div>
          <Transition name="cfg">
            <div v-if="rezerwacje" class="mt-4">
              <label class="text-sm text-muted">Z jakiego systemu korzystasz?</label>
              <select
                v-model="provider"
                data-cursor="hover"
                class="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus-visible:border-brand"
              >
                <option value="">— wybierz —</option>
                <option value="booksy">Booksy</option>
                <option value="calendly">Calendly</option>
                <option value="inny">Inny system</option>
                <option value="brak">Nie mam — pomóżcie wybrać</option>
              </select>
            </div>
          </Transition>
        </fieldset>
      </div>

      <!-- right: live summary -->
      <div data-cfg class="lg:sticky lg:top-24">
        <div class="overflow-hidden rounded-3xl border-2 border-brand/30 bg-paper p-8 shadow-[0_30px_70px_-40px_rgba(109,94,252,0.6)]">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-brand-strong">Twoja wycena</p>

          <div class="mt-5 flex items-baseline gap-2">
            <span class="display text-6xl text-ink">{{ startTotal }}</span>
            <span class="text-2xl font-medium text-ink">zł</span>
            <span class="text-sm text-muted">na start</span>
          </div>
          <div class="mt-1 text-lg font-semibold text-ink">+ {{ mcTotal }} zł <span class="text-sm font-normal text-muted">/ miesięcznie</span></div>

          <ul class="mt-6 space-y-2 border-t border-line pt-6 text-sm">
            <li v-for="b in breakdown" :key="b.label" class="flex items-center justify-between gap-3">
              <span class="text-muted">{{ b.label }}</span>
              <span class="shrink-0 font-medium text-ink">
                <template v-if="b.start">{{ b.start }} zł</template>
                <template v-if="b.start && b.mc"> · </template>
                <template v-if="b.mc">{{ b.mc }} zł/mc</template>
              </span>
            </li>
          </ul>

          <button
            data-cursor="hover"
            class="mt-7 w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            @click="scrollTo('#kontakt')"
          >
            Odbierz darmowy projekt
          </button>
          <p class="mt-3 text-center text-xs text-muted">
            Bez zobowiązań · Płacisz dopiero, gdy zdecydujesz
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cfg-enter-active,
.cfg-leave-active {
  transition: all 0.35s var(--ease-out-expo);
}
.cfg-enter-from,
.cfg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
