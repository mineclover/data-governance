export function sortDpmProfileConnectorSourceVersionHashes(
  input: Readonly<Record<string, string>>,
): Record<string, string> {
  const sorted: Record<string, string> = {}
  for (const key of Object.keys(input).sort()) {
    const value = input[key]
    if (value) sorted[key] = value
  }
  return sorted
}
