# Phase 8 Authoring Quick-Fix Decision

**Status: private follow-on implemented 2026-07-15; no public-release effect**

This record supplements the [Phase 8 private activation decision](./phase-8-decision-record.md),
the [scoped lookup decision](./phase-8-scoped-lookup-decision.md), the
[import/export decision](./phase-8-authoring-import-export-decision.md), and the
[explain decision](./phase-8-authoring-explain-decision.md). It activates a narrow,
semantic-diff-only quick-fix suggestion surface for private authoring review.

## Decisions

| Decision | Adopted rule | Reason |
| --- | --- | --- |
| Surface | Expose `createDpmAuthoringQuickFixes` through the private `authoring` subpath. | Gives consumers deterministic machine-readable review suggestions without adding a service or CLI dependency. |
| Input boundary | Accept only a `DpmAuthoringSemanticDiff`; do not re-read definitions or repositories. | Keeps the helper pure and prevents hidden persistence or authorization behavior. |
| Suggestions | Emit `review-breaking-change` for every breaking change, `confirm-rename-alias` for a non-breaking rename whose previous locator is preserved as an alias, and `confirm-deprecation` for a non-breaking transition to `deprecated`. | Covers the safe, explainable cases already classified by the semantic diff while making no unsupported edits. |
| Safety | Every suggestion has `requiresApproval: true` and `autoApplicable: false`. | A helper may identify the next review action, but only the existing role-gated publish flow may change an authoring revision. |
| Determinism | Sort suggestions by kind, identity, and source change kind, then return deeply frozen output. | Makes snapshots, review UIs, and repeated diagnostics stable. |
| Data safety | Do not copy `before`/`after` payloads into the result. | Avoids accidental propagation of descriptions, storage details, values, or secrets into a convenience surface. |
| Side effects | Do not write drafts, revisions, audit events, indexes, or database rows. | Keeps quick-fix generation read-only and usable before durable persistence exists. |
| Compatibility boundary | Keep package identity, wire version, T1 metadata, license, tag, registry, and adapter unchanged. | Preserves the private release gate. |

## Acceptance criteria

- breaking semantic changes produce an explicit approval-required review suggestion;
- alias-preserved renames and deprecation transitions are distinguishable from breaking changes;
- unsupported safe additions and non-breaking API-binding changes produce no speculative action;
- results are deterministic, deeply immutable, and contain no raw change payloads;
- package build, typecheck, tests, docs, boundary, roadmap, and consumer smoke remain green.

## Deferred follow-ons

- automatic mutation or bulk application of suggestions;
- cross-definition search and durable broad indexing;
- sensitivity/owner metadata and relationship/policy/trace extensions;
- PostgreSQL migration/deployment and external authorization integration;
- public metadata, license, registry publication, `v*` tag, and adapter cutover.
