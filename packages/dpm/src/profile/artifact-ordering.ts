import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export function byId<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id)
}

export function byDiagnostic(left: DpmProfileDiagnostic, right: DpmProfileDiagnostic): number {
  return `${left.severity}.${left.code}.${left.message}`.localeCompare(`${right.severity}.${right.code}.${right.message}`)
}
