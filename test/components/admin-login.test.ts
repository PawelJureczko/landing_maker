import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdminLogin } from '../../app/composables/useAdminLogin'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch
beforeEach(() => mockFetch.mockReset())

describe('useAdminLogin', () => {
  it('zwraca nextStep z odpowiedzi', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, nextStep: 'verify' })
    const f = useAdminLogin()
    Object.assign(f.form, { email: 'a@b.pl', password: 'x' })
    const step = await f.submit()
    expect(step).toBe('verify')
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
  })
  it('mapuje błąd serwera', async () => {
    mockFetch.mockRejectedValueOnce({ data: { error: 'Nieprawidłowy email lub hasło' } })
    const f = useAdminLogin()
    await f.submit()
    expect(f.error.value).toMatch(/email lub hasło/i)
  })
})
