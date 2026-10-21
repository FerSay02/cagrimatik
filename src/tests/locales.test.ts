import { describe, expect, it } from 'vitest'
import tr from '../locales/tr.json'
import en from '../locales/en.json'

function paths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item,index) => paths(item, `${prefix}[${index}]`))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key,item]) => paths(item, prefix ? `${prefix}.${key}` : key))
  return [prefix]
}
describe('translations', () => {
  it('has matching keys in both languages', () => expect(paths(tr).sort()).toEqual(paths(en).sort()))
  it('has natural, nonempty strings in both languages', () => {
    const values = (obj: unknown): string[] => Array.isArray(obj) ? obj.flatMap(values) : obj && typeof obj === 'object' ? Object.values(obj).flatMap(values) : [String(obj)]
    expect(values(tr).every(v => v.trim().length > 0)).toBe(true)
    expect(values(en).every(v => v.trim().length > 0)).toBe(true)
  })
})
