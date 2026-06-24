import * as OTPAuth from 'otpauth'

const ISSUER = 'witrynovo.pl'

export function generateSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32
}

function totpFor(secret: string, email = ISSUER): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
}

export function otpauthUrl(secret: string, email: string): string {
  return totpFor(secret, email).toString()
}

export function verifyTotp(secret: string, code: string): boolean {
  // window: 1 → tolerancja ±1 krok (rozjazd zegara). validate zwraca delta|null.
  return totpFor(secret).validate({ token: code.trim(), window: 1 }) !== null
}
