import { describe, expect, it } from 'vitest'
import { nowIso } from '../../../src/utils/date'

describe('nowIso', () => {
  it('returns a valid ISO 8601 timestamp', () => {
    const value = nowIso()
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    expect(Number.isNaN(Date.parse(value))).toBe(false)
  })

  it('returns a time close to the current moment', () => {
    const before = Date.now()
    const parsed = Date.parse(nowIso())
    const after = Date.now()
    expect(parsed).toBeGreaterThanOrEqual(before - 1000)
    expect(parsed).toBeLessThanOrEqual(after + 1000)
  })
})
