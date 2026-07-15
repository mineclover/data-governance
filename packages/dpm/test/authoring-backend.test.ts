import { describe, expect, it } from 'vitest'

import {
  DPM_AUTHORING_BACKEND_ENV,
  DPM_DEFAULT_AUTHORING_BACKEND,
  isDpmAuthoringBackend,
  resolveDpmAuthoringBackend,
} from '../src/index.js'

describe('DPM authoring backend configuration contract', () => {
  it('defaults to memory when the environment is unset', () => {
    expect(resolveDpmAuthoringBackend({ env: {} })).toEqual({
      backend: DPM_DEFAULT_AUTHORING_BACKEND,
      source: 'default',
    })
  })

  it('resolves the environment variable and preserves the explicit override', () => {
    expect(resolveDpmAuthoringBackend({
      env: { [DPM_AUTHORING_BACKEND_ENV]: ' postgres ', },
    })).toEqual({ backend: 'postgres', source: 'environment' })

    expect(resolveDpmAuthoringBackend({
      backend: 'memory',
      env: { [DPM_AUTHORING_BACKEND_ENV]: 'postgres' },
    })).toEqual({ backend: 'memory', source: 'explicit' })
  })

  it('rejects invalid values instead of silently falling back', () => {
    expect(() => resolveDpmAuthoringBackend({
      env: { [DPM_AUTHORING_BACKEND_ENV]: 'sqlite' },
    })).toThrow('memory, postgres')
    expect(() => resolveDpmAuthoringBackend({ backend: '' })).toThrow('memory, postgres')
    expect(isDpmAuthoringBackend('memory')).toBe(true)
    expect(isDpmAuthoringBackend('sqlite')).toBe(false)
  })
})
