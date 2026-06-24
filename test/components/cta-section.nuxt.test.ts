/**
 * Testuje REALNĄ logikę formularza CtaSection przez współdzielony composable
 * `useLeadForm` (ten sam kod, którego używa komponent) — bez duplikacji.
 *
 * Node env, bez DOM-u: środowiska Nuxt i happy-dom zawieszają pulę workerów
 * vitest w tym sandboxie (nuxt@4.4.5 + @nuxt/test-utils@4.0.3). Logika wysyłki
 * nie potrzebuje DOM-u, więc testujemy ją bezpośrednio, mockując globalny $fetch.
 * Render szablonu (ukrycie honeypota, checkbox, animacja sukcesu) pozostaje do
 * weryfikacji ręcznym smoke'em w przeglądarce.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLeadForm } from '../../app/composables/useLeadForm'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('useLeadForm (logika CtaSection)', () => {
  it('nie wysyła, gdy brakuje zgody', async () => {
    const f = useLeadForm()
    Object.assign(f.form, { imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber' })
    // zgoda celowo nie zaznaczona
    await f.submit()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(f.submitted.value).toBe(false)
  })

  it('wysyła leada na /api/leads z honeypotem i ts, pokazuje sukces', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const f = useLeadForm()
    f.markRendered()
    Object.assign(f.form, {
      imie: 'Jan',
      kontakt: 'jan@firma.pl',
      branza: 'Barber',
      zgoda: true,
    })
    await f.submit()

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/leads')
    expect(opts.method).toBe('POST')
    expect(opts.body).toMatchObject({
      imie: 'Jan',
      kontakt: 'jan@firma.pl',
      branza: 'Barber',
      website: '',
    })
    expect(opts.body).toHaveProperty('ts')
    expect(f.submitted.value).toBe(true)
  })

  it('mapuje błędy 422 na serverErrors i nie pokazuje sukcesu', async () => {
    mockFetch.mockRejectedValueOnce({
      statusCode: 422,
      data: { errors: { kontakt: 'Podaj poprawny telefon lub e-mail' } },
    })
    const f = useLeadForm()
    Object.assign(f.form, { imie: 'Jan', kontakt: 'x', branza: 'Barber', zgoda: true })
    await f.submit()

    expect(f.serverErrors.kontakt).toBe('Podaj poprawny telefon lub e-mail')
    expect(f.submitted.value).toBe(false)
  })

  it('pokazuje ogólny komunikat przy innym błędzie serwera', async () => {
    mockFetch.mockRejectedValueOnce({ statusCode: 500 })
    const f = useLeadForm()
    Object.assign(f.form, {
      imie: 'Jan',
      kontakt: 'jan@firma.pl',
      branza: 'Barber',
      zgoda: true,
    })
    await f.submit()

    expect(f.submitError.value).toContain('Coś poszło nie tak')
    expect(f.submitted.value).toBe(false)
  })
})
