export type DpmProfileConnectorFreshness = {
  runHash: string
  profileVersionHash?: string
  sourceVersionHashes?: Record<string, string>
}
