import type {
  DpmCrossDefinitionReadModelAuthorization,
} from './read-model-contract.js'

/**
 * Private-only scope resolver adapter for conformance evidence. It does not integrate an
 * identity provider; callers must inject the already resolved definition scope.
 */
export function createDpmCrossDefinitionReadModelScopedAuthorization(
  callerDefinitionIds: readonly string[],
): DpmCrossDefinitionReadModelAuthorization {
  const callerScope = new Set(callerDefinitionIds)

  return ({ requestedDefinitionIds }) => {
    const requestedScope = requestedDefinitionIds === undefined
      ? [...callerScope].sort()
      : [...new Set(requestedDefinitionIds)].sort()
    const allowed = requestedScope.length > 0 && requestedScope.every(definitionId => callerScope.has(definitionId))
    return allowed
      ? { allowed: true, definitionIds: requestedScope }
      : { allowed: false, definitionIds: [] }
  }
}
