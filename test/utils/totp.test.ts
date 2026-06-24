import { describe, it, expect } from 'vitest'
import * as OTPAuth from 'otpauth'
import { generateSecret, otpauthUrl, verifyTotp } from '../../server/utils/totp'

function currentCode(secret: string): string {
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) })
  return totp.generate()
}

describe('totp', () => {
  it('generuje sekret base32 i poprawny kod przechodzi', () => {
    const secret = generateSecret()
    expect(secret).toMatch(/^[A-Z2-7]+$/)
    expect(verifyTotp(secret, currentCode(secret))).toBe(true)
  })
  it('odrzuca zły kod', () => {
    const secret = generateSecret()
    expect(verifyTotp(secret, '000000')).toBe(false)
  })
  it('otpauthUrl zawiera issuera i email', () => {
    const url = otpauthUrl(generateSecret(), 'admin@witrynovo.pl')
    expect(url).toMatch(/^otpauth:\/\/totp\//)
    expect(url).toContain('witrynovo')
    expect(url).toContain('admin%40witrynovo.pl')
  })
})
