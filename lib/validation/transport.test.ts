import { describe, expect, it } from 'vitest'
import { validateTransportApplication, validateTransportJob } from './transport'

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

describe('validateTransportJob', () => {
  const valid = {
    item: 'トラクター 25馬力',
    from: '長野県 松本市',
    to: '長野県 諏訪市',
    distanceKm: '40',
    weight: '約1.2t',
    desiredDate: '相談',
    reward: '14000',
    contactEmail: 'owner@example.com',
  }

  it('accepts a job request and normalizes numbers', () => {
    const result = validateTransportJob(valid)
    expect(result.ok).toBe(true)
    if (result.ok)
      expect(result.value).toMatchObject({ distanceKm: 40, reward: 14_000 })
  })

  it('requires every field with numeric distance and reward', () => {
    const result = validateTransportJob({
      ...valid,
      distanceKm: '-1',
      reward: 'abc',
      item: '',
    })
    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(Object.keys(result.errors).sort()).toEqual([
        'distanceKm',
        'item',
        'reward',
      ])
  })
})
