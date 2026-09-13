import { describe, expect, it } from 'vitest'
import {
  validateTransportApplication,
  validateTransportRegistration,
} from './transport'

describe('validateTransportRegistration', () => {
  const valid = {
    name: '佐藤運送',
    kind: '法人',
    prefecture: '秋田県',
    vehicle: '4tトラック',
    email: 'sato@example.com',
    note: '週末中心に対応できます。',
  }

  it('accepts a registration and keeps the note optional', () => {
    expect(validateTransportRegistration(valid).ok).toBe(true)
    const noNote = validateTransportRegistration({ ...valid, note: '' })
    expect(noNote.ok).toBe(true)
    if (noNote.ok) expect(noNote.value.note).toBeUndefined()
  })

  it('rejects unknown kinds and vehicles', () => {
    const result = validateTransportRegistration({
      ...valid,
      kind: '団体',
      vehicle: '自転車',
    })
    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(Object.keys(result.errors).sort()).toEqual(['kind', 'vehicle'])
  })
})

describe('validateTransportApplication', () => {
  const valid = {
    name: '高橋 健',
    email: 'ken@example.com',
    vehicle: '2tトラック',
    availableDate: '2026-10-03',
    message: '',
  }

  it('accepts an application', () => {
    expect(validateTransportApplication(valid).ok).toBe(true)
  })

  it('requires a name, email, vehicle, and date', () => {
    const result = validateTransportApplication({})
    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(Object.keys(result.errors).sort()).toEqual([
        'availableDate',
        'email',
        'name',
        'vehicle',
      ])
  })
})
