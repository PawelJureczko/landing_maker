import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, isAdminSession } from '../../server/utils/auth'

describe('hashPassword / verifyPassword', () => {
  it('weryfikuje poprawne hasło', async () => {
    const hash = await hashPassword('tajneHaslo123')
    expect(hash).not.toContain('tajneHaslo123')
    expect(await verifyPassword(hash, 'tajneHaslo123')).toBe(true)
  })
  it('odrzuca złe hasło', async () => {
    const hash = await hashPassword('tajneHaslo123')
    expect(await verifyPassword(hash, 'zle')).toBe(false)
  })
  it('verifyPassword nie rzuca przy śmieciowym hashu', async () => {
    expect(await verifyPassword('not-a-hash', 'cokolwiek')).toBe(false)
  })
})

describe('isAdminSession', () => {
  it('true tylko dla zalogowanego z mfa', () => {
    expect(isAdminSession({ user: { id: 1, email: 'a@b.pl' }, mfa: true })).toBe(true)
  })
  it('false dla pending (mfa false)', () => {
    expect(isAdminSession({ user: { id: 1, email: 'a@b.pl' }, mfa: false })).toBe(false)
  })
  it('false dla braku sesji/usera', () => {
    expect(isAdminSession(null)).toBe(false)
    expect(isAdminSession({})).toBe(false)
  })
})
