import { describe, it, expect } from 'vitest'
import { validateNoteBody } from '../../server/utils/admin-queries'

describe('validateNoteBody', () => {
  it('akceptuje niepustą treść', () => expect(validateNoteBody('cześć')).toBeNull())
  it('odrzuca pustą/whitespace', () => {
    expect(validateNoteBody('   ')).toMatch(/wymagana/i)
    expect(validateNoteBody(123)).toMatch(/wymagana/i)
  })
})
