import { describe, it, expect, beforeEach } from 'vitest'
import {
  isHoneypotTripped, isTooFast, rateLimit, _resetRateLimit,
} from '../../server/utils/antispam'

describe('isHoneypotTripped', () => {
  it('false gdy pole puste/niewypełnione', () => {
    expect(isHoneypotTripped({})).toBe(false)
    expect(isHoneypotTripped({ website: '' })).toBe(false)
  })
  it('true gdy bot wypełnił honeypot', () => {
    expect(isHoneypotTripped({ website: 'http://spam' })).toBe(true)
  })
})

describe('isTooFast', () => {
  const now = 1_000_000
  it('true gdy zgłoszenie szybsze niż 2s', () => {
    expect(isTooFast(now - 500, now)).toBe(true)
  })
  it('false gdy minęło wystarczająco', () => {
    expect(isTooFast(now - 5000, now)).toBe(false)
  })
  it('true gdy brak/niepoprawny znacznik', () => {
    expect(isTooFast(undefined, now)).toBe(true)
    expect(isTooFast('abc', now)).toBe(true)
  })
  it('false przy ujemnym elapsed (rozjazd zegara) — nie karzemy', () => {
    expect(isTooFast(now + 5000, now)).toBe(false)
  })
})

describe('rateLimit', () => {
  beforeEach(() => _resetRateLimit())
  it('przepuszcza do limitu, potem blokuje', () => {
    const now = 1_000_000
    for (let i = 0; i < 5; i++) expect(rateLimit('1.1.1.1', now)).toBe(true)
    expect(rateLimit('1.1.1.1', now)).toBe(false)
  })
  it('różne IP mają osobne liczniki', () => {
    const now = 1_000_000
    for (let i = 0; i < 5; i++) rateLimit('1.1.1.1', now)
    expect(rateLimit('2.2.2.2', now)).toBe(true)
  })
  it('okno wygasa po czasie', () => {
    const now = 1_000_000
    for (let i = 0; i < 5; i++) rateLimit('1.1.1.1', now)
    expect(rateLimit('1.1.1.1', now + 61_000)).toBe(true)
  })
})
