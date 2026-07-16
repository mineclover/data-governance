import { describe, expect, it } from 'vitest'

import { DPM_BASELINE, DPM_PACKAGE_NAME, DPM_VERSION } from '../src/index.js'

describe('@context-action/dpm scaffold', () => {
  it('exports the package identity for scaffold smoke checks', () => {
    expect(DPM_PACKAGE_NAME).toBe('@context-action/dpm')
    expect(DPM_BASELINE).toBe('relationship-first')
    expect(DPM_VERSION).toBe('1.0')
  })
})
