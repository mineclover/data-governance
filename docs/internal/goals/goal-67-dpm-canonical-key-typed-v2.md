# Goal 67 - DPM Canonical Key Typed Encoding v2

**Status: complete 2026-07-10**

> Predecessor: [Goal 64 - DPM Column Policy Uniqueness](./goal-64-dpm-column-policy-uniqueness.md)

## Purpose

The v1 canonical-key renderer converts every non-date value with `String(value)`.
That makes values with different runtime types, such as `1` and `"1"` or `null`
and `"null"`, indistinguishable before deterministic tokenization. Goal 67 adds an
injective typed encoding without silently changing any existing v1 key, token,
registry, or compiled-plan identity.

## Compatibility Boundary

Canonical-key encoding is a versioned data identity contract, not a formatting
detail.

- `string-v1` preserves every existing renderer output and remains the default for
  manifests, registries, and model inputs that do not declare a version.
- `typed-v2` must be selected explicitly during the compatibility window.
- A manifest and its registry snapshot must use the same encoding version before a
  compiled plan can be created.
- A compiled plan and its freshness evidence record the selected encoding version.
- A later DPM major may make `typed-v2` the default only after v1 references and
  rollback requirements have been retired.

The implementation must never reinterpret an existing v1 token namespace as v2.
Real data migration uses a new namespace or parallel target columns, validates the
new relationship joins, and switches consumers atomically.

## Typed v2 Wire Format

`typed-v2` uses an explicit format marker, structural segment kinds, type tags, and
UTF-8 byte lengths. Delimiters inside names or values therefore cannot change the
segment boundary.

The wire grammar is:

```text
key       = "typed-v2|n|" frame(namespace) tenant* predicate? column+
tenant    = "|t|" frame(tenant-column) "|" type-tag "|" frame(payload)
predicate = "|p|s|" frame(predicate-sql)
column    = "|c|" frame(column-name) "|" type-tag "|" frame(payload)
frame(x)  = utf8-byte-length(x) ":" x
```

`n`, `t`, `p`, and `c` distinguish namespace, tenant-column, predicate, and key-column
segments. Every length is the UTF-8 byte count of the following value, not its
JavaScript character count. The v2 renderer ignores the v1 separator because its
framed grammar supplies its own unambiguous boundaries.

Supported value tags are:

| Runtime value | Tag | Canonical payload |
|---|---|---|
| `string` | `s` | original UTF-8 string |
| finite `number` | `n` | deterministic JavaScript numeric rendering, with `-0` preserved |
| `boolean` | `b` | `true` or `false` |
| `bigint` | `i` | base-10 integer without suffix |
| valid `Date` | `d` | `toISOString()` |
| `null` | `z` | empty payload |

`NaN`, positive or negative infinity, invalid dates, missing (`undefined`) column
values, and strings containing unpaired UTF-16 surrogates are rejected. Rejecting
ill-formed Unicode prevents `TextEncoder` replacement with U+FFFD from collapsing
distinct JavaScript strings at the UTF-8 wire boundary. Column order,
tenant-column order, and predicate position remain part of the identity.

## Registry Storage Authority

The selected version is persisted data, not an export-time presentation option.

- New relationship saves and normalized Postgres rows always carry
  `canonicalKeyEncodingVersion`. The public custom-adapter row field remains
  optional during the migration window; a missing legacy field means `string-v1`.
- Postgres schema v2 adds a registry-wide `relationship_registry_contracts` row
  keyed by `(dataset_id, registry_version)`. Relationship rows carry the same
  version and reference that contract through a composite foreign key.
- Contract claim uses `INSERT ... ON CONFLICT` and relationship upsert uses the same
  claim in a CTE, so concurrent v1/v2 first writers cannot both persist. A conflict
  returns no claim row and blocks the relationship write.
- The idempotent migration adds the relationship column with a `string-v1` default,
  fails explicitly if existing rows are mixed or conflict with metadata, backfills
  one contract per registry, and then installs the foreign key.
- Custom storage adapters remain source-compatible for v1. Typed-v2 save requires
  explicit atomic `claimCanonicalKeyEncodingVersion` and
  `readCanonicalKeyEncodingContract` capabilities; the repository does not assume
  an unverified custom adapter is race-safe.
- Snapshot export derives the version from persisted rows. It rejects mixed row
  versions and treats an empty row set without metadata as v1. An authoritative
  metadata row permits an empty typed-v2 registry without request-time relabeling.
- `expectedCanonicalKeyEncodingVersion` is assertion-only. It cannot relabel stored
  rows, and both repository and gateway boundaries reject an expectation mismatch.

## Versioned Identity Grammar

Legacy identities remain byte-for-byte unchanged:

```text
v1 registry = dataset-id "@" registry-version
v1 plan     = "compiled-plan:" manifest-id ":" registry-version
```

Typed-v2 uses disjoint prefixes and framed components instead of appending a suffix
to a legacy identity:

```text
v2 registry = "dpm.relationship.registry-snapshot.typed-v2|d|" frame(dataset-id)
              "|r|" frame(registry-version)
v2 plan     = "dpm.compiled-plan.typed-v2|m|" frame(manifest-id)
              "|r|" frame(registry-version)
```

This prevents a typed plan for registry `R` from colliding with a legacy plan for
registry `R:typed-v2`, while preserving all existing v1 identities.

## Migration Stages

1. Freeze v1 golden vectors and add typed-v2 collision vectors.
2. Add the additive model renderer option and version taxonomy.
3. Carry the version through manifest reference, registry snapshot, compiled plan,
   freshness evidence, gateway schema, and package exports.
4. Block manifest/registry version mismatch before plan generation.
5. Run v1 and v2 into separate namespaces or parallel target columns and compare
   affected rows and relationship joins.
6. Switch downstream readers only after parity evidence is accepted; retain the v1
   path for rollback.
7. Retire v1 data only when no plan, registry, token lookup, or consumer references
   it.

This goal implements and tests the package-level identity contract through stage 4,
plus a rollback fixture for stage 6. Live dual writes, row backfills, parity evidence,
consumer cutover, and data retirement remain deployment/data-plane work and do not
run inside the DPM compiler.

## Implementation Evidence

- `model/canonical-key-encoding.ts` owns the public encoding taxonomy, type guard,
  default, and resolver. Entity and relationship key strategies normalize omitted
  versions to `string-v1`.
- `model/canonical-key.ts` keeps the legacy renderer isolated and byte-for-byte
  unchanged while dispatching explicit `typed-v2` requests to the framed renderer.
  `model/utf8-frame.ts` supplies shared well-formed Unicode validation and UTF-8
  framing for canonical keys and versioned identities.
- The manifest's additive `relationship_registry.canonical_key_encoding_version`
  reference and every registry snapshot's `canonicalKeyEncodingVersion` field
  default independently to `string-v1`. A mismatch produces blocking `REL011`
  diagnostics before assembly.
- Compiled plans and freshness evidence carry the selected version. Legacy v1 plan
  and registry identities remain unchanged; v2 uses the disjoint, length-framed
  identity grammar above.
- Storage row, Postgres DDL/migration, repository mapper, gateway request/response,
  and runtime snapshot paths carry the taxonomy without allowing export requests to
  select persisted identity. Legacy snapshots missing the field normalize to v1 at
  validator and compiler boundaries.
- Snapshot normalization recomputes the expected identity from dataset, registry
  version, and resolved encoding; custom snapshots with incompatible identity text
  are rejected before validation, compilation, or gateway re-export.
- Public plan-aware entity and relationship renderers assert that the model strategy
  matches the compiled-plan version, preventing an omitted renderer option from
  silently selecting v1 under a v2 plan. Subpath smoke tests render a v2 golden
  vector in a fresh built process.
- Collision, Unicode/delimiter, invalid-value, model compatibility, schema,
  registry, compiler, gateway, and migration fixtures cover the compatibility
  boundary. The migration fixture proves implicit v1, explicit v2, both mismatch
  directions, and a byte-for-byte v1 rollback plan.

## Done Criteria

- Existing v1 entity and relationship canonical-key golden strings are unchanged.
- `1`/`"1"`, `null`/`"null"`, `true`/`"true"`, bigint/string, and Date/ISO-string
  pairs produce different typed-v2 keys.
- Typed-v2 output is deterministic across invocation order and process restarts.
- Invalid numeric/date values and missing values fail explicitly.
- Ill-formed Unicode is rejected before UTF-8 framing.
- Manifest and registry encoding mismatch produces a blocking diagnostic and no
  compiled plan.
- Registry snapshot, compiled plan, freshness record, and gateway schema expose the
  encoding version.
- Persisted metadata/rows are the registry encoding authority; mixed rows, request
  relabeling, and metadata-free empty-registry v2 assertions are rejected.
- Postgres metadata claim plus the relationship foreign key prevents concurrent
  first-write version races; typed-v2 custom storage must expose the atomic contract
  capability.
- Registry and plan v2 identities use disjoint framed grammars while v1 identities
  remain exact.
- A migration fixture proves a real missing-field legacy snapshot, explicit v2,
  mismatch rejection, collision resistance, and rollback against a literal pre-v2
  plan golden.
- The package does not mutate live token rows or claim data-plane migration proof;
  deployments must execute stages 5-7 against their own namespaces and consumers.
- DPM focused tests, typecheck, package surface smokes, API index, feature matrix,
  release policy, and `git diff --check` pass.
