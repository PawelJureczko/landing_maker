import { describe, it, expect, vi } from 'vitest'
import { handleLogin, type LoginDeps } from '../../server/utils/handle-login'

const user = { id: 1, email: 'admin@witrynovo.pl', passwordHash: 'HASH', totpEnabled: false }

function deps(over: Partial<LoginDeps> = {}): LoginDeps {
  return {
    now: 1000,
    ip: '1.1.1.1',
    rateLimit: () => true,
    findUserByEmail: vi.fn(async () => user),
    verifyPassword: vi.fn(async () => true),
    ...over,
  }
}

const body = { email: 'admin@witrynovo.pl', password: 'dobreHaslo1' }

describe('handleLogin', () => {
  it('poprawne dane, totp wyłączone → 200 + nextStep enroll + session', async () => {
    const r = await handleLogin(body, deps())
    expect(r.status).toBe(200)
    expect(r.body.nextStep).toBe('enroll')
    expect(r.session).toEqual({ id: 1, email: 'admin@witrynovo.pl' })
  })

  it('poprawne dane, totp włączone → nextStep verify', async () => {
    const d = deps({ findUserByEmail: vi.fn(async () => ({ ...user, totpEnabled: true })) })
    const r = await handleLogin(body, d)
    expect(r.body.nextStep).toBe('verify')
  })

  it('złe hasło → 401 ogólny komunikat, brak session', async () => {
    const d = deps({ verifyPassword: vi.fn(async () => false) })
    const r = await handleLogin(body, d)
    expect(r.status).toBe(401)
    expect(r.session).toBeUndefined()
    expect(r.body.error).toMatch(/email lub hasło/i)
  })

  it('nieznany email → 401 + i tak woła verifyPassword (równanie timingu)', async () => {
    const verify = vi.fn(async () => false)
    const d = deps({ findUserByEmail: vi.fn(async () => null), verifyPassword: verify })
    const r = await handleLogin(body, d)
    expect(r.status).toBe(401)
    expect(verify).toHaveBeenCalledOnce()
  })

  it('przekroczony limit → 429', async () => {
    const r = await handleLogin(body, deps({ rateLimit: () => false }))
    expect(r.status).toBe(429)
  })

  it('brak email/hasła → 401', async () => {
    const r = await handleLogin({ email: '', password: '' }, deps())
    expect(r.status).toBe(401)
  })
})
