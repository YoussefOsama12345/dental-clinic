import { describe, expect, it } from 'vitest'
import { parsePage, parsePageSize } from '../../../src/utils/pagination'
import { PAGINATION } from '../../../src/constants/app.constants'

describe('parsePage', () => {
  it('returns the page when given a valid positive integer', () => {
    expect(parsePage(3)).toBe(3)
    expect(parsePage('5')).toBe(5)
  })

  it('floors fractional pages', () => {
    expect(parsePage(2.9)).toBe(2)
  })

  it('falls back to default for non-positive, NaN, or missing values', () => {
    expect(parsePage(0)).toBe(PAGINATION.defaultPage)
    expect(parsePage(-1)).toBe(PAGINATION.defaultPage)
    expect(parsePage('abc')).toBe(PAGINATION.defaultPage)
    expect(parsePage(undefined)).toBe(PAGINATION.defaultPage)
    expect(parsePage(null)).toBe(PAGINATION.defaultPage)
  })
})

describe('parsePageSize', () => {
  it('returns the page size for a valid value', () => {
    expect(parsePageSize(10)).toBe(10)
    expect(parsePageSize('25')).toBe(25)
  })

  it('caps the page size at the maximum', () => {
    expect(parsePageSize(1000)).toBe(PAGINATION.maxPageSize)
    expect(parsePageSize(PAGINATION.maxPageSize + 1)).toBe(PAGINATION.maxPageSize)
  })

  it('allows exactly the maximum', () => {
    expect(parsePageSize(PAGINATION.maxPageSize)).toBe(PAGINATION.maxPageSize)
  })

  it('floors fractional page sizes', () => {
    expect(parsePageSize(15.7)).toBe(15)
  })

  it('falls back to default for non-positive, NaN, or missing values', () => {
    expect(parsePageSize(0)).toBe(PAGINATION.defaultPageSize)
    expect(parsePageSize(-5)).toBe(PAGINATION.defaultPageSize)
    expect(parsePageSize('xyz')).toBe(PAGINATION.defaultPageSize)
    expect(parsePageSize(undefined)).toBe(PAGINATION.defaultPageSize)
  })
})
