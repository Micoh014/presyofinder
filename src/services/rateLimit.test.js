import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isRateLimited } from './rateLimit'

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false on first call', () => {
    expect(isRateLimited('test-first', 1000)).toBe(false)
  })

  it('returns true when called again within the limit window', () => {
    isRateLimited('test-block', 1000)
    expect(isRateLimited('test-block', 1000)).toBe(true)
  })

  it('returns false after the limit window has passed', () => {
    isRateLimited('test-expire', 1000)
    vi.advanceTimersByTime(1001)
    expect(isRateLimited('test-expire', 1000)).toBe(false)
  })

  it('treats different keys independently', () => {
    isRateLimited('key-a', 1000)
    expect(isRateLimited('key-b', 1000)).toBe(false)
  })

  it('respects custom limitMs', () => {
    isRateLimited('test-custom', 500)
    vi.advanceTimersByTime(499)
    expect(isRateLimited('test-custom', 500)).toBe(true)
    vi.advanceTimersByTime(2)
    expect(isRateLimited('test-custom', 500)).toBe(false)
  })
})