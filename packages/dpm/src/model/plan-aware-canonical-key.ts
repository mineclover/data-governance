import type { DpmCompiledPlan } from '../compiler/plan-compiled-types.js'
import {
  resolveDpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingVersion,
} from './canonical-key-encoding.js'
import type { CanonicalKeyValueMap } from './canonical-key.js'
import { renderEntityCanonicalKey } from './entity-canonical-key.js'
import type { EntityDeclaration } from './entity-types.js'
import { renderRelationshipCanonicalKey } from './relationship-canonical-key.js'
import type { LogicalRelationship } from './relationship-types.js'

export type DpmCanonicalKeyEncodingPlan = Pick<
  DpmCompiledPlan,
  'canonicalKeyEncodingVersion'
>

export function assertDpmCanonicalKeyEncodingVersionMatchesPlan(
  plan: DpmCanonicalKeyEncodingPlan,
  rendererEncodingVersion?: DpmCanonicalKeyEncodingVersion,
  label = 'canonical key renderer',
): void {
  const resolvedRendererVersion = resolveDpmCanonicalKeyEncodingVersion(
    rendererEncodingVersion,
    `${label} encodingVersion`,
  )
  if (resolvedRendererVersion === plan.canonicalKeyEncodingVersion) return

  throw new Error(
    `${label} uses canonical key encoding ${resolvedRendererVersion}, but compiled plan requires `
    + `${plan.canonicalKeyEncodingVersion}.`,
  )
}

export function renderEntityCanonicalKeyForPlan(
  plan: DpmCanonicalKeyEncodingPlan,
  entity: Pick<EntityDeclaration, 'namespace' | 'keyStrategy'>,
  values: CanonicalKeyValueMap,
): string {
  assertDpmCanonicalKeyEncodingVersionMatchesPlan(
    plan,
    entity.keyStrategy.encodingVersion,
    'entity canonical key renderer',
  )
  return renderEntityCanonicalKey(entity, values)
}

export function renderRelationshipCanonicalKeyForPlan(
  plan: DpmCanonicalKeyEncodingPlan,
  relationship: Pick<LogicalRelationship, 'namespace' | 'type' | 'condition' | 'canonicalKey'>,
  values: CanonicalKeyValueMap,
): string {
  assertDpmCanonicalKeyEncodingVersionMatchesPlan(
    plan,
    relationship.canonicalKey.encodingVersion,
    'relationship canonical key renderer',
  )
  return renderRelationshipCanonicalKey(relationship, values)
}
