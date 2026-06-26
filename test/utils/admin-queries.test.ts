import { describe, it, expect } from 'vitest'
import { parseLeadQuery, isValidStatus } from '../../server/utils/admin-queries'

describe('isValidStatus', () => {
  it('akceptuje status z enuma', () => expect(isValidStatus('won')).toBe(true))
  it('odrzuca spoza enuma', () => expect(isValidStatus('foo')).toBe(false))
})

describe('parseLeadQuery', () => {
  it('przepuszcza poprawny status, branżę i q', () => {
    expect(parseLeadQuery({ status: 'new', branza: 'Barber', q: 'jan' }))
      .toEqual({ status: 'new', branza: 'Barber', q: 'jan' })
  })
  it('pomija niepoprawny status', () => {
    expect(parseLeadQuery({ status: 'foo' })).toEqual({})
  })
  it('pomija puste wartości', () => {
    expect(parseLeadQuery({ status: '', branza: '', q: '' })).toEqual({})
  })
})
