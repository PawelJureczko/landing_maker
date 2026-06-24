import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAdmin2fa } from '../../app/composables/useAdmin2fa'

const mockFetch = vi.fn()
;(globalThis as any).$fetch = mockFetch
beforeEach(() => mockFetch.mockReset())

describe('useAdmin2fa', () => {
  it('startEnroll pobiera otpauthUrl', async () => {
    mockFetch.mockResolvedValueOnce({ otpauthUrl: 'otpauth://totp/x', secret: 'S' })
    const f = useAdmin2fa()
    await f.startEnroll()
    expect(f.qrUrl.value).toBe('otpauth://totp/x')
    expect(f.secret.value).toBe('S')
  })
  it('verify zwraca true przy sukcesie', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const f = useAdmin2fa()
    f.code.value = '123456'
    expect(await f.verify()).toBe(true)
  })
  it('verify mapuje błąd i zwraca false', async () => {
    mockFetch.mockRejectedValueOnce({ data: { error: 'Nieprawidłowy kod.' } })
    const f = useAdmin2fa()
    expect(await f.verify()).toBe(false)
    expect(f.error.value).toMatch(/kod/i)
  })
  it('loadState ustawia needsEnroll z API', async () => {
    mockFetch.mockResolvedValueOnce({ needsEnroll: true })
    const f = useAdmin2fa()
    expect(f.needsEnroll.value).toBe(false)
    await f.loadState()
    expect(f.needsEnroll.value).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/2fa/state')
  })
})
