import { describe, expect, it } from 'vitest'

import { classifyRelationshipCandidate } from '../src/index.js'

describe('DPM relationship discovery classification', () => {
  it('classifies high confidence candidates as review because auto-approval is out of scope', () => {
    expect(classifyRelationshipCandidate(0.999)).toEqual({
      level: 'high',
      recommendation: 'review',
    })
    expect(classifyRelationshipCandidate(0.5)).toEqual({
      level: 'low',
      recommendation: 'reject',
    })
  })
})
