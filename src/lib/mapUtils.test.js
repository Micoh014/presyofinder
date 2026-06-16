import { describe, it, expect } from 'vitest'
import { getDistanceMeters, getPinColor } from './mapUtils'

describe('getDistanceMeters', () => {
  it('returns 0 for identical coordinates', () => {
    const dist = getDistanceMeters(14.5995, 120.9842, 14.5995, 120.9842)
    expect(dist).toBe(0)
  })

  it('returns a positive distance for different coordinates', () => {
    // Manila to Quezon City, roughly 10-12km apart
    const dist = getDistanceMeters(14.5995, 120.9842, 14.6760, 121.0437)
    expect(dist).toBeGreaterThan(5000)
    expect(dist).toBeLessThan(20000)
  })

  it('is symmetric (A to B equals B to A)', () => {
    const distAB = getDistanceMeters(14.5995, 120.9842, 14.6760, 121.0437)
    const distBA = getDistanceMeters(14.6760, 121.0437, 14.5995, 120.9842)
    expect(distAB).toBeCloseTo(distBA, 5)
  })
})

describe('getPinColor', () => {
  const store = { id: 'store-1' }

  it('returns default color when no search results', () => {
    expect(getPinColor(store, [])).toBe('#6366f1')
  })

  it('returns gray when store has no matching result', () => {
    const results = [{ stores: { id: 'other-store' }, price: 50 }]
    expect(getPinColor(store, results)).toBe('#9ca3af')
  })

  it('returns green when store has the cheapest price', () => {
    const results = [
      { stores: { id: 'store-1' }, price: 30 },
      { stores: { id: 'store-2' }, price: 50 },
    ]
    expect(getPinColor(store, results)).toBe('#22c55e')
  })

  it('returns red when store has the most expensive price', () => {
    const results = [
      { stores: { id: 'store-1' }, price: 80 },
      { stores: { id: 'store-2' }, price: 50 },
    ]
    expect(getPinColor(store, results)).toBe('#ef4444')
  })

  it('returns yellow when store is in between', () => {
    const results = [
      { stores: { id: 'store-1' }, price: 50 },
      { stores: { id: 'store-2' }, price: 30 },
      { stores: { id: 'store-3' }, price: 80 },
    ]
    expect(getPinColor(store, results)).toBe('#eab308')
  })
})