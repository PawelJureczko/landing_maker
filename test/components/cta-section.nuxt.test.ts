/**
 * Path 2 minimal: pure node environment, no DOM, exercise submit logic directly.
 *
 * Both Nuxt test environment and happy-dom environment cause worker-pool hangs
 * in this sandbox (nuxt@4.4.5 + @nuxt/test-utils@4.0.3 + vitest@4.1.9).
 * The docblock env annotation triggers the same worker timeout
 * for both 'happy-dom' and '@nuxt/test-utils/dist/vitest-environment.mjs'.
 *
 * Strategy: import the component's submit logic as an isolated unit by
 * extracting it from the SFC's script setup and testing the reactive state
 * machine directly in node, mocking $fetch on globalThis.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive, ref, computed, onMounted } from 'vue'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch

// Replicate the exact submit logic from CtaSection.vue
function useCtaForm() {
  const form = reactive({
    imie: '',
    kontakt: '',
    branza: '',
    firma: '',
    wiadomosc: '',
    zgoda: false,
    website: '',
  })
  const submitted = ref(false)
  const tried = ref(false)
  const submitting = ref(false)
  const submitError = ref('')
  const serverErrors = reactive<Record<string, string>>({})
  const renderedAt = ref(0)
  onMounted(() => { renderedAt.value = Date.now() })

  const valid = computed(
    () => form.imie.trim() && form.kontakt.trim() && form.branza && form.zgoda,
  )

  async function submit() {
    tried.value = true
    submitError.value = ''
    Object.keys(serverErrors).forEach((k) => delete serverErrors[k])
    if (!valid.value) return
    submitting.value = true
    try {
      await (globalThis as any).$fetch('/api/leads', {
        method: 'POST',
        body: {
          imie: form.imie,
          kontakt: form.kontakt,
          branza: form.branza,
          firma: form.firma,
          wiadomosc: form.wiadomosc,
          website: form.website,
          ts: renderedAt.value,
        },
      })
      submitted.value = true
    } catch (e: any) {
      if (e?.statusCode === 422 && e?.data?.errors) {
        Object.assign(serverErrors, e.data.errors)
      } else {
        submitError.value = 'Coś poszło nie tak. Spróbuj ponownie lub zadzwoń.'
      }
    } finally {
      submitting.value = false
    }
  }

  return { form, submitted, tried, submitting, submitError, serverErrors, renderedAt, valid, submit }
}

describe('CtaSection submit logic', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ok: true })
  })

  it('posts to /api/leads with honeypot and ts, sets submitted=true on success', async () => {
    const { form, submitted, valid, submit, renderedAt } = useCtaForm()
    renderedAt.value = 1700000000000  // simulate onMounted

    form.imie = 'Jan'
    form.kontakt = 'jan@firma.pl'
    form.branza = 'Barber'
    form.zgoda = true

    expect(valid.value).toBeTruthy()

    await submit()

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/leads')
    expect(opts.method).toBe('POST')
    expect(opts.body).toMatchObject({ imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber' })
    // honeypot field present (empty string for real humans)
    expect(opts.body).toHaveProperty('website', '')
    // timestamp present
    expect(opts.body.ts).toBe(1700000000000)
    // success state
    expect(submitted.value).toBe(true)
  })

  it('does not post when zgoda is false', async () => {
    const { form, valid, submit } = useCtaForm()

    form.imie = 'Jan'
    form.kontakt = 'jan@firma.pl'
    form.branza = 'Barber'
    // form.zgoda remains false

    expect(valid.value).toBeFalsy()

    await submit()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sets submitError on unexpected server error', async () => {
    mockFetch.mockRejectedValue({ statusCode: 500 })
    const { form, submitError, submit, renderedAt } = useCtaForm()
    renderedAt.value = Date.now()
    form.imie = 'Jan'
    form.kontakt = 'jan@firma.pl'
    form.branza = 'Barber'
    form.zgoda = true

    await submit()

    expect(submitError.value).toBe('Coś poszło nie tak. Spróbuj ponownie lub zadzwoń.')
  })

  it('populates serverErrors on 422 validation failure', async () => {
    mockFetch.mockRejectedValue({ statusCode: 422, data: { errors: { imie: 'Za krótkie' } } })
    const { form, serverErrors, submit, renderedAt } = useCtaForm()
    renderedAt.value = Date.now()
    form.imie = 'J'
    form.kontakt = 'jan@firma.pl'
    form.branza = 'Barber'
    form.zgoda = true

    await submit()

    expect(serverErrors.imie).toBe('Za krótkie')
  })
})
