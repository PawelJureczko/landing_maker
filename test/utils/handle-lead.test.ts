import { describe, it, expect, vi } from 'vitest'
import { handleLead, type LeadDeps } from '../../server/utils/handle-lead'

const now = 1_000_000
const validBody = {
  imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber',
  ts: now - 5000, website: '',
}

function deps(over: Partial<LeadDeps> = {}): LeadDeps {
  return {
    now,
    ip: '1.1.1.1',
    rateLimit: () => true,
    insertLead: vi.fn(async () => {}),
    sendMail: vi.fn(async () => {}),
    ...over,
  }
}

describe('handleLead', () => {
  it('poprawny lead → 200, zapis i mail wywołane', async () => {
    const d = deps()
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).toHaveBeenCalledOnce()
    expect(d.sendMail).toHaveBeenCalledOnce()
  })

  it('honeypot → 200, brak zapisu (cichy sukces)', async () => {
    const d = deps()
    const r = await handleLead({ ...validBody, website: 'spam' }, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('za szybkie zgłoszenie → 200, brak zapisu', async () => {
    const d = deps()
    const r = await handleLead({ ...validBody, ts: now - 100 }, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('przekroczony rate-limit → 429', async () => {
    const d = deps({ rateLimit: () => false })
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(429)
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('zły input → 422 z błędami pól', async () => {
    const d = deps()
    const r = await handleLead({ ...validBody, imie: '' }, d)
    expect(r.status).toBe(422)
    expect(r.body.errors?.imie).toBeTruthy()
    expect(d.insertLead).not.toHaveBeenCalled()
  })

  it('błąd zapisu → 500, mail nie wysłany', async () => {
    const d = deps({ insertLead: vi.fn(async () => { throw new Error('db down') }) })
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(500)
    expect(d.sendMail).not.toHaveBeenCalled()
  })

  it('błąd maila przy udanym zapisie → nadal 200', async () => {
    const d = deps({ sendMail: vi.fn(async () => { throw new Error('smtp down') }) })
    const r = await handleLead(validBody, d)
    expect(r.status).toBe(200)
    expect(d.insertLead).toHaveBeenCalledOnce()
  })
})
