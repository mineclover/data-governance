import { describe, expect, it } from 'vitest'

import {
  expectedProfilerPostgresOrdersSource,
} from './support/catalog-profiler-expected-fixtures.js'
import {
  createProfilerPostgresSnapshot,
} from './support/catalog-profiler-row-fixtures.js'

describe('DPM PostgreSQL catalog profiler source map', () => {
  it('maps database source coordinates into catalog source pointers', () => {
    const snapshot = createProfilerPostgresSnapshot()

    expect(snapshot.sources['table:public.orders']).toEqual(expectedProfilerPostgresOrdersSource)
  })
})
