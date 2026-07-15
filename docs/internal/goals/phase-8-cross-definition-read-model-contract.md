# Phase 8 Cross-Definition Read-Model Contract

**Status: private contract prepared 2026-07-15; runtime activation deferred**
**Runtime activation: deferred**

This document prepares the entry contract for the first Phase 8 follow-on: a bounded,
cross-definition read model. It does not activate a search service, add a public package surface,
apply a PostgreSQL migration, integrate an external authorization provider, or authorize any T1
release action.

## Purpose and boundary

The current private slice searches one definition at a time. The next recommended capability is a
read-only projection that can resolve the same logical field across authorized definitions without
turning display names, API artifacts, or catalog coordinates into a new source of truth.

The contract owner is the private `mineclover/data-governance` repository. The operational runtime
owner is not yet assigned. PostgreSQL remains the prepared durable target from the
[persistence proposal](./phase-8-persistence-proposal.md), but no database or deployment change is
authorized by this contract.

## Adopted recommendation

- Prioritize cross-definition read/search before automatic mutation and bulk authoring.
- Keep the first implementation read-only and projection-based.
- Search only immutable, latest published revisions by default; drafts and historical revisions
  require a separately authorized scope.
- Use canonical object/API/DB identities as lookup keys. A display name, table name, or
  `operationId` is never a canonical cross-definition identity.
- Fail closed when authorization, index freshness, or result bounds cannot be established.
- Keep sensitivity, owner, relationship/policy, trace where-used, full-text search, and raw values
  outside this contract until separately owned and approved.

## Contract invariants

### Canonical source and identity

The source of a hit is one normalized `DpmAuthoringPublishedRevision`. The read model may project
references and searchable attributes, but it must be able to hydrate the source revision by
`definitionId` and `revisionId`.

Each indexed row is scoped by the following compound identity:

```text
(ownerNamespace, definitionId, revisionId, identityKind, identityKey, objectId)
```

`identityKind` is one of `object`, `api`, or `db`. `identityKey` is produced by the existing
canonical identity helpers. The index must preserve the matched `objectId`; it must not derive a
logical identity from a name or coordinate. A result represents one logical field per source
revision, even if multiple API bindings match; matched identity keys are returned as context.

### Ownership and projection

| Data | Authority | Read-model rule |
| --- | --- | --- |
| logical object, field, binding, lifecycle | DPM published revision | Store canonical references and hydrate from the immutable source |
| API artifact identity and version hash | API artifact/provenance input | Store the canonical API key and freshness reference; do not rewrite the artifact |
| DB catalog snapshot and coordinate | catalog snapshot input | Store the canonical DB key and freshness reference; do not perform DDL |
| sensitivity, owner, policy, relationship, trace where-used | future product owners | Excluded until a separate metadata contract is approved |
| sample values, secrets, credentials | never a read-model authority | Never store, return, or infer them |

### Index generation, freshness, and rebuild

1. A published revision is immutable. A new revision creates a new index generation; it never
   mutates the source revision or silently replaces its history.
2. A generation is visible only after all of its rows are written atomically and its source
   `revisionId` and `freshnessIdentity` are recorded.
3. A rebuild is idempotent for `(definitionId, revisionId, freshnessIdentity)` and must be safe to
   retry after interruption. Partial generations are not queryable.
4. The projection exposes an explicit state of `building`, `ready`, `stale`, or `failed`, together
   with the source revision and freshness identity. A stale or failed generation is not silently
   served as a successful empty result.
5. The default consistency mode is strict: a query returns `read-model-unavailable` when the
   authorized latest published revision does not have a `ready` generation. Serving stale data
   requires a separately approved operational policy and caller capability.

### Authorization scope

The caller supplies an owner-injected authorization policy. The policy resolves an explicit set of
definition scopes before the query is evaluated; the default policy is deny. External OIDC/RBAC
integration is not part of this contract.

- A query must not disclose whether an out-of-scope definition or identity exists.
- Result counts, pagination cursors, freshness state, and error messages are computed only over
  the caller's authorized scope.
- A definition scope is part of the query context, not a filter that can be bypassed by an
  identity key.

### Query and result bounds

The first contract supports exact identity lookup plus constrained field predicates. It does not
support arbitrary SQL, regex, unbounded wildcard, or full-text search.

- Cross-definition field queries require an explicit authorized scope and at least one bounded
  predicate: dataset/namespace/entity, full locator, field name, semantic type, origin, or
  lifecycle.
- `pageSize` defaults to `25` and has a hard maximum of `100`.
- The result set is ordered by
  `(definitionId, revisionId, objectId, identityKind, identityKey)` and uses an opaque cursor
  containing that complete sort tuple. Results must be deterministic for the same source and
  freshness state.
- A hit contains `definitionId`, `revisionId`, `objectId`, the identity match context, the
  identity-only field locator, and API binding identity references. It does not contain sample
  values, secrets, credentials, or an unbounded raw definition document.
- Duplicate identity matches collapse to one logical-field hit; the matched keys remain sorted
  context on that hit.

### Failure and lifecycle semantics

The read model is read-only. It cannot create drafts, apply quick fixes, approve changes, publish
revisions, roll back revisions, or mutate a source definition. A source revision that is removed
from the latest-published view is no longer returned by the default query, but remains available
through the existing immutable revision/audit contract.

The implementation must distinguish at least these outcomes:

| Outcome | Meaning | Safe consumer behavior |
| --- | --- | --- |
| `ready` | all authorized source generations are queryable | return bounded deterministic hits |
| `read-model-unavailable` | missing, building, stale, or failed generation | retry/rebuild through an operational path; do not treat as no match |
| `forbidden` | the requested scope is not authorized | return no cross-scope existence information |
| `invalid-query` | bounds or predicate contract is violated | ask the caller to narrow the query |

## Activation gates

Runtime activation remains deferred until all of the following are explicitly accepted:

1. An operational owner is named for index storage, rebuild, monitoring, backup, and rollback.
2. The durable target and transaction/retention policy are approved; applying PostgreSQL schema or
   connecting to an owner-managed database is a separate change.
3. The authorization adapter maps callers to definition scopes with deny-by-default behavior.
4. The source-to-index freshness and rebuild protocol is implemented with an idempotent retry
   path and no partial visibility.
5. A private fixture proves two definitions with colliding display names, exact API/DB identity
   lookup, unauthorized-scope isolation, stale-index rejection, deterministic pagination, and
   duplicate collapse.
6. The owner records acceptance of this contract before a new runtime API or persistent index is
   activated.

Until these gates are met, this document is a recommendation and review artifact only. No
PostgreSQL migration, external authorization integration, production deployment, public package
metadata, registry publication, license finalization, `v*` tag, or adapter cutover is performed.

## Evidence and revisit trigger

The contract drift check is `pnpm check:read-model-contract`. The contract is revisited when the
owner selects an operational owner and accepts the persistence/authorization entry conditions in
an explicit review record. Passing private tests or T1 preflight alone does not activate it.
