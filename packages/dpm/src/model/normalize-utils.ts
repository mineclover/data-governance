export function requireNonEmpty(value: string, label: string): string {
  if (value.length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
  return value
}
