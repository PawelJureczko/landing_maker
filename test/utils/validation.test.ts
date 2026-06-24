import { describe, it, expect } from 'vitest'
import { parseLead, isEmail, isPhone } from '../../server/utils/validation'

describe('isEmail / isPhone', () => {
  it('rozpoznaje e-mail', () => {
    expect(isEmail('jan@firma.pl')).toBe(true)
    expect(isEmail('jan(at)firma')).toBe(false)
  })
  it('rozpoznaje telefon', () => {
    expect(isPhone('+48 600 700 800')).toBe(true)
    expect(isPhone('123')).toBe(false)
  })
})

describe('parseLead', () => {
  const ok = { imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber' }

  it('przyjmuje poprawnego leada', () => {
    const r = parseLead(ok)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.imie).toBe('Jan')
  })

  it('odrzuca brak imienia', () => {
    const r = parseLead({ ...ok, imie: '   ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.imie).toBeTruthy()
  })

  it('odrzuca kontakt, który nie jest ani telefonem, ani e-mailem', () => {
    const r = parseLead({ ...ok, kontakt: 'zadzwoń do mnie' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.kontakt).toBeTruthy()
  })

  it('odrzuca branżę spoza listy', () => {
    const r = parseLead({ ...ok, branza: 'Kowboj' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.branza).toBeTruthy()
  })

  it('akceptuje telefon jako kontakt i puste pola opcjonalne', () => {
    const r = parseLead({ ...ok, kontakt: '600700800', firma: '', wiadomosc: '' })
    expect(r.ok).toBe(true)
  })
})
