import { describe, it, expect } from 'vitest'
import { validateNewUserInput } from '../../scripts/create-user'

describe('validateNewUserInput', () => {
  it('akceptuje poprawny email i hasło ≥10 znaków', () => {
    expect(validateNewUserInput('admin@witrynovo.pl', 'dobreHaslo1')).toBeNull()
  })
  it('odrzuca zły email', () => {
    expect(validateNewUserInput('niepoprawny', 'dobreHaslo1')).toMatch(/email/i)
  })
  it('odrzuca za krótkie hasło', () => {
    expect(validateNewUserInput('admin@witrynovo.pl', 'krotkie')).toMatch(/hasło/i)
  })
})
