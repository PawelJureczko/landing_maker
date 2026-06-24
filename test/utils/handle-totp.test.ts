import { describe, it, expect } from 'vitest'
import { handleTotpVerify, type TotpDeps } from '../../server/utils/handle-totp'

function deps(over: Partial<TotpDeps> = {}): TotpDeps {
  return {
    now: 1000,
    ip: '1.1.1.1',
    rateLimit: () => true,
    secret: 'SECRET',
    isEnrollment: false,
    verifyTotp: () => true,
    ...over,
  }
}

describe('handleTotpVerify', () => {
  it('poprawny kod (logowanie) → 200 + mfa, bez persistSecret', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps())
    expect(r.status).toBe(200)
    expect(r.mfa).toBe(true)
    expect(r.persistSecret).toBeUndefined()
  })
  it('poprawny kod (enrollment) → 200 + mfa + persistSecret', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps({ isEnrollment: true }))
    expect(r.mfa).toBe(true)
    expect(r.persistSecret).toBe('SECRET')
  })
  it('zły kod → 401, brak mfa', async () => {
    const r = await handleTotpVerify({ code: '000000' }, deps({ verifyTotp: () => false }))
    expect(r.status).toBe(401)
    expect(r.mfa).toBeUndefined()
  })
  it('brak sekretu w sesji → 400', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps({ secret: null }))
    expect(r.status).toBe(400)
  })
  it('przekroczony limit → 429', async () => {
    const r = await handleTotpVerify({ code: '123456' }, deps({ rateLimit: () => false }))
    expect(r.status).toBe(429)
  })
})
