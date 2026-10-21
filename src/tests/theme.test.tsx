import { fireEvent, renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from '../hooks/useTheme'

describe('theme preference', () => {
  beforeEach(() => { const values = new Map<string,string>(); vi.stubGlobal('localStorage', { getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => values.set(key,value), removeItem: (key:string) => values.delete(key), clear: () => values.clear() }) })
  afterEach(() => vi.unstubAllGlobals())
  it('follows system preference until manually selected', () => {
    const original = window.matchMedia
    let change: (() => void) | undefined
    let dark = false
    window.matchMedia = () => ({ get matches(){ return dark }, addEventListener: (_type: string, listener: () => void) => { change = listener }, removeEventListener: () => {}, media: '', onchange: null, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => true } as unknown as MediaQueryList)
    try {
      const { result } = renderHook(useTheme)
      expect(result.current.theme).toBe('light')
      dark = true; act(() => change?.())
      expect(result.current.theme).toBe('dark')
      act(() => result.current.update('light'))
      expect(localStorage.getItem('cm-theme')).toBe('light')
      dark = false; act(() => change?.())
      expect(result.current.theme).toBe('light')
      fireEvent(window, new Event('storage'))
    } finally { window.matchMedia = original }
  })
})
