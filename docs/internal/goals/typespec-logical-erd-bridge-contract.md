# TypeSpec Logical ERD Bridge Contract

**Status: private owner bridge prototype — persistence and package release remain gated**

## Purpose

`oa-sdk.logical-erd.v1` is the logical-model artifact emitted from TypeSpec. It owns
the data model: entities, keys, and logical relationships. DPM is the **Data
Pseudonymization Manifest**: an opt-in policy/execution contract for deciding how a
selected logical field is handled across catalog and API evidence. It is not a general
ERD, database-schema, or relationship registry replacement. A relationship-aware DPM
execution case, if later needed, is a separate proposal with its own physical-policy
inputs; it is not an extension of this bridge.

The bridge starts *after* an ERD exists. It projects selected ERD fields into DPM's
separate object/revision/policy vocabulary without letting either system infer the
other's authority.

```text
checked TypeSpec ERD artifact
  -- explicit field coverage + owner DPM identity mapping --> DPM v1.1 definitions
  -- optional read-only catalog snapshot --> confirmed/mismatch/unbound/unknown evidence
```

The implementation is in `packages/dpm/src/bridge/typespec-logical-erd.ts` and is
exported from the private `@oa-sdk/dpm/data` surface. It is pure: it writes neither
a DPM revision nor a registry record, and it never opens a database connection.

## Non-inference rules

| ERD fact | Bridge rule |
| --- | --- |
| stable field ID | Must receive exactly one explicit `project` or `exclude` disposition; omission is an error. |
| projected field | Receives owner-provided DPM object ID, revision ID, entity scope, type, origin, lifecycle, and optional storage reference. No value is derived from the field name or locator. |
| TypeSpec source span | Is retained as bridge provenance for each projected field; it is not a DPM object identity or DB coordinate. |
| logical relationship | Is outside this field-only bridge. DPM transform strategy, orphan policy, canonical-key components, and physical endpoint are never inferred from ERD cardinality. |
| persisted field | Read-only catalog evidence checks snapshot ID, freshness hash, table/column membership, and provided source coordinate. |
| non-persisted/excluded field | Reports `unbound`, not a catalog mismatch. |

## Preconditions and trust boundary

The bridge accepts the structural artifact shape to avoid a dependency from the DPM
owner package back to the private TypeSpec prototype. Callers must first run the
TypeSpec owner gate (`oa-erd check`), which validates the portable JSON Schema,
cross-references, and normalized artifact hash. The bridge validates its own coverage
and DPM identity inputs but intentionally does not reimplement the ERD artifact hash
algorithm or become its competing schema owner.

## Activation gates

This prototype becomes an accepted DPM adapter only after the DPM release authority
records all of the following in the owner review workflow:

1. the ERD artifact version and upstream `oa-erd check` gate accepted as input;
2. a representative mapping fixture approved for persisted, non-persisted, renamed,
   and excluded fields;
3. catalog snapshot identity/freshness owner and mismatch policy named;
4. compatibility, package, and rollback evidence completed before any persistent
   DPM revision or consumer route is enabled.

Mapping an ERD relationship into an executable DPM relationship is **not** an
activation gate for this bridge. It is a separate, future policy proposal only when a
pseudonymization workflow demonstrably needs relationship-aware execution.

Until then this contract is an evidence adapter only. It does not emit
`dpm.data-binding-artifact.v1`, change `data_definitions` wire compatibility, alter
DDL/migrations/FKs, or grant publication authority.

## Verification

`packages/dpm/test/typespec-logical-erd-bridge.test.ts` proves explicit field and
field coverage, DPM identity projection, AST provenance retention, catalog
confirmation, no-catalog `unknown`, and source-coordinate mismatch rejection.
