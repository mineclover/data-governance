export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

export function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
