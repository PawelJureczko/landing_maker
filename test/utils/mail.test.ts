import { describe, it, expect } from 'vitest'
import { buildLeadEmail } from '../../server/utils/mail'
import type { LeadInput } from '../../server/utils/validation'

const lead: LeadInput = {
  imie: 'Jan', kontakt: 'jan@firma.pl', branza: 'Barber',
  firma: 'Razor Sznyt', wiadomosc: 'mam logo',
}

describe('buildLeadEmail', () => {
  it('ustawia to/from i temat z imieniem i branżą', () => {
    const msg = buildLeadEmail(lead, { to: 'kontakt@witrynovo.pl', from: 'no-reply@witrynovo.pl' })
    expect(msg.to).toBe('kontakt@witrynovo.pl')
    expect(msg.from).toBe('no-reply@witrynovo.pl')
    expect(msg.subject).toContain('Jan')
    expect(msg.subject).toContain('Barber')
  })

  it('treść zawiera wszystkie wypełnione pola', () => {
    const { text } = buildLeadEmail(lead, { to: 'a@b.pl', from: 'c@d.pl' })
    expect(text).toContain('jan@firma.pl')
    expect(text).toContain('Razor Sznyt')
    expect(text).toContain('mam logo')
  })

  it('pomija puste pola opcjonalne', () => {
    const { text } = buildLeadEmail(
      { imie: 'Ala', kontakt: '600700800', branza: 'Inna', firma: '', wiadomosc: '' },
      { to: 'a@b.pl', from: 'c@d.pl' },
    )
    expect(text).not.toContain('Firma:')
    expect(text).not.toContain('Wiadomość:')
  })
})
