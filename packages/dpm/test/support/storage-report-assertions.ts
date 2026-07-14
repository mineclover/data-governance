import { expect } from 'vitest'

import {
  STORAGE_REPORT_UNSAFE_PAYLOAD_FRAGMENTS,
} from './storage-report-unsafe-fixtures.js'

export function expectStorageReportPayloadExcludesUnsafeFragments(payload: unknown): void {
  const serialized = JSON.stringify(payload)

  for (const unsafeFragment of STORAGE_REPORT_UNSAFE_PAYLOAD_FRAGMENTS) {
    expect(serialized).not.toContain(unsafeFragment)
  }
}
