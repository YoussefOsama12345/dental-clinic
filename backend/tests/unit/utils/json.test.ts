import { describe, expect, it } from 'vitest'
import { parseJsonArray, stringifyJsonArray } from '../../../src/utils/json'

describe('parseJsonArray', () => {
  it('parses a valid JSON string array', () => {
    expect(parseJsonArray('["a","b","c"]')).toEqual(['a', 'b', 'c'])
  })

  it('returns an empty array for null, undefined, or empty input', () => {
    expect(parseJsonArray(null)).toEqual([])
    expect(parseJsonArray(undefined)).toEqual([])
    expect(parseJsonArray('')).toEqual([])
  })

  it('returns an empty array for invalid JSON', () => {
    expect(parseJsonArray('not json')).toEqual([])
    expect(parseJsonArray('{')).toEqual([])
  })

  it('returns an empty array when JSON is not an array', () => {
    expect(parseJsonArray('{"a":1}')).toEqual([])
    expect(parseJsonArray('"just a string"')).toEqual([])
    expect(parseJsonArray('42')).toEqual([])
  })

  it('filters out non-string array members', () => {
    expect(parseJsonArray('["a",1,true,"b",null]')).toEqual(['a', 'b'])
  })
})

describe('stringifyJsonArray', () => {
  it('stringifies a string array', () => {
    expect(stringifyJsonArray(['x', 'y'])).toBe('["x","y"]')
  })

  it('returns "[]" for null or undefined', () => {
    expect(stringifyJsonArray(null)).toBe('[]')
    expect(stringifyJsonArray(undefined)).toBe('[]')
  })

  it('round-trips with parseJsonArray', () => {
    const input = ['penicillin', 'latex']
    expect(parseJsonArray(stringifyJsonArray(input))).toEqual(input)
  })
})
