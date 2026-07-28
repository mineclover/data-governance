# TypeSpec Logical ERD Bridge Owner Acceptance Checklist

**Status: prepared for owner review — no acceptance or cutover is implied by this document**

> Contract: [TypeSpec logical ERD bridge contract](./typespec-logical-erd-bridge-contract.md)

## Change under review

| Item | Value |
| --- | --- |
| DPM surface | private `@oa-sdk/dpm/data` bridge helpers |
| Input evidence | `oa-sdk.logical-erd.v1` artifact that has first passed `oa-erd check` |
| Output | in-memory DPM v1.1 identity definitions plus immutable coverage/provenance and optional catalog evidence |
| Mutation | none — no DPM repository write, registry write, DDL, migration, or physical FK mutation |
| Relationship handling | outside the bridge; ERD relationships are neither read nor projected by DPM |
| Catalog handling | optional, read-only snapshot identity/freshness/table/column/source-coordinate comparison |

## Owner decisions required

The release authority should record an explicit decision for every row. An unchecked row
means the bridge remains an evidence-only private helper.

- [ ] Accept `oa-sdk.logical-erd.v1` as an allowed upstream *evidence* input after its own schema,
  semantic, and normalized-hash check; DPM does not become its wire-format owner.
- [ ] Accept the representative field mapping fixture: stable ERD field ID maps explicitly to DPM
  object ID, revision ID, entity scope, semantic type, origin/lifecycle, and storage reference.
- [ ] Accept explicit `exclude` dispositions as the only way an ERD field may be outside DPM scope.
- [ ] Accept TypeSpec AST spans as review provenance only, never as DPM object identity, catalog
  identity, or DB source of truth.
- [ ] Name the catalog snapshot owner, stable snapshot-ID convention, freshness SLA, and review
  policy for `confirmed`, `mismatch`, `unbound`, and `unknown` results.
- [ ] Decide whether a later approved bridge writes a draft/revision, emits a neutral DPM artifact,
  or remains a review-only adapter. This prototype grants none of those actions.
- [ ] Record SemVer/package/release implications and rollback input preservation before enabling any
  persistent consumer route.

## Evidence to review

| Claim | Current evidence | Required confirmation |
| --- | --- | --- |
| no identity inference | `packages/dpm/test/typespec-logical-erd-bridge.test.ts` fails missing/duplicate coverage and uses explicit DPM inputs | inspect fixture names and IDs |
| provenance retained | projected field output retains original `field:<id>` span/decorator span | inspect a real TypeSpec artifact fixture |
| no DPM relationship activation | the bridge input has no relationship field | no approval is needed: logical ERD remains authoritative |
| catalog is read-only evidence | test proves confirmed, unknown, and source-coordinate mismatch; helper accepts an in-memory snapshot only | name production snapshot producer and review policy |
| package boundary | `pnpm --filter @oa-sdk/dpm smoke:subpaths` verifies runtime and declaration exports | confirm no registry/package release action is implied |

## Required commands before acceptance

```bash
# In data-governance
corepack pnpm build
corepack pnpm typecheck
corepack pnpm test
corepack pnpm --filter @oa-sdk/dpm smoke:subpaths
corepack pnpm check:boundary
corepack pnpm check:docs
corepack pnpm check:roadmap

# In oa-sdk, against the selected TypeSpec artifact
pnpm --filter @oa-sdk/typespec-erd exec oa-erd check --artifact path/to/logical-erd.json
pnpm --filter @oa-sdk/typespec-erd exec oa-erd review \
  --artifact path/to/logical-erd.json \
  --catalog-evidence path/to/dpm-catalog-evidence.json \
  --format json --output path/to/logical-erd.review.json
```

The `review` output is deterministic review evidence only. It records the same
artifact ID, every logical source-provenance subject, optional semantic diff,
and the DPM-supplied catalog statuses; it is not a DPM write input or OpenAPI
code-generation input.

If a future pseudonymization use case needs relationship-aware execution, it starts a
separate policy proposal. That proposal must supply physical endpoints, transform
strategy, orphan policy, and canonical-key policy; it does not retroactively turn all
ERD relationships into DPM relationships.

## Explicit non-approval statement

Passing the commands or checking this file into a branch does not approve a DPM
lifecycle change, database integration, registry publication, public release, DDL,
migration, or physical FK. Those outcomes require the recorded owner decisions above.
