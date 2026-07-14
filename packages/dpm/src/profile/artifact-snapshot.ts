import { copyDpmProfileArtifact } from './artifact-envelope-copy.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

type DpmDeepReadonly<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer Item)[]
      ? readonly DpmDeepReadonly<Item>[]
      : T extends object
        ? { readonly [Key in keyof T]: DpmDeepReadonly<T[Key]> }
        : T

export type DpmProfileArtifactSnapshot = DpmDeepReadonly<DpmProfileArtifact>

export function createDpmProfileArtifactSnapshot(
  profile: DpmProfileArtifact,
): DpmProfileArtifactSnapshot {
  return freezeDeep(copyDpmProfileArtifact(profile))
}

function freezeDeep<T>(value: T): DpmDeepReadonly<T> {
  if (!value || typeof value !== 'object') return value as DpmDeepReadonly<T>
  if (Object.isFrozen(value)) return value as DpmDeepReadonly<T>

  for (const next of Object.values(value as Record<string, unknown>)) {
    freezeDeep(next)
  }

  return Object.freeze(value) as DpmDeepReadonly<T>
}
