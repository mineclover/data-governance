export function arrayOf(items: unknown) {
  return {
    type: 'array',
    items,
  }
}
