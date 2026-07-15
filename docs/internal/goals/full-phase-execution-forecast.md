# DPM Full Phase Execution Forecast

**Status: planning forecast; no Phase 8 activation or public release authorization**
**Updated: 2026-07-15**

This document forecasts the complete DPM roadmap from Phase 0 through Phase 10. It is an execution
model, not a release approval. The [DPM Master Roadmap](./dpm-master-roadmap.md) remains canonical
for scope and the [roadmap checkpoint](./roadmap-checkpoint.md) remains canonical for routine
progress feedback.

## Forecast conventions

- A **work unit** means one focused implementation/documentation change plus its local verification
  and CI loop. It is not a calendar promise.
- **High confidence** means the work is already implemented or the acceptance contract is fixed.
- **Medium confidence** means the scope is clear but owner/product decisions can change the slice.
- **Low confidence** means a separate owner, security model, registry, or deployment authority is
  still required.
- Calendar dates are intentionally not predicted before the relevant owner gate is approved.

## Phase summary

| Phase | Capability | Current state | Next deliverable | Forecast | Confidence |
| --- | --- | --- | --- | --- | --- |
| 0 | Governance and ownership | Complete; private owner accepted | Routine checkpoint/evidence maintenance | 0–1 maintenance units | High |
| 1 | Relationship contract | Complete and tested | Compatibility maintenance only | 0–1 maintenance units | High |
| 2 | Evidence and proposal | Complete and tested | Compatibility maintenance only | 0–1 maintenance units | High |
| 3 | Approval and durability | Complete within boundary | Compatibility maintenance only | 0–1 maintenance units | High |
| 4 | Public package contract | Complete privately; public metadata gated | T1 policy/approval packet | 2–4 units after approval | Medium |
| 5 | Logical identity and wire contract | Complete and accepted privately | Future owner-authorized wire revisions only | 0–2 extension units | High |
| 6 | Cross-object semantic binding | Complete and accepted privately | Future owner-authorized diagnostics/read-model consumers | 0–2 extension units | High |
| 7 | Neutral artifact and provenance | Complete and accepted privately | Feed the Phase 8 slice and extraction compatibility | 0–2 extension units | High |
| 8 | Search, edit, authoring control plane | Proposal ready; not active | Owner activation, then representative slice | 6–10 units after activation | Medium |
| 9 | External extraction and compatibility transition | Private rehearsal accepted; T1 pending | Owner policy, exact release, T1 gate, one compatibility release | 3–5 units after approval | Medium/Low |
| 10 | Production data-plane runtime | Explicitly outside current roadmap | Separate runtime owner/security/deployment program | Not estimable; likely 10+ units | Low |

## Phase detail and exit criteria

### Phases 0–4 — completed foundation and T1 preparation

The relationship-first contract, evidence/proposal workflows, approval/durability boundary, package
subpaths, consumer smokes, private extraction, and owner governance are complete. The only active
follow-up is maintenance plus the T1 decision packet:

- confirm package identity and public registry target;
- select and approve license/redistribution policy;
- confirm the exact first release reference;
- run owner CI for that exact commit and obtain explicit owner approval.

Until those decisions are complete, Phase 4 remains private and no T1 tag or public metadata is
created.

### Phases 5–7 — accepted contract plane

The identity, semantic binding, neutral artifact, freshness, provenance, and rollback contracts are
implemented and privately accepted. Their remaining forecast is maintenance or owner-authorized
extension only; they are not a reason to reopen the completed contract goals.

### Phase 8 — recommended representative slice

After explicit activation, implement the [Phase 8 control-plane proposal](./phase-8-control-plane-proposal.md)
in this order:

1. identity lookup/read model;
2. immutable published revision and draft/base-revision concurrency;
3. validate-preview, semantic diff, and breaking classification;
4. approval, publish, audit readback, and rollback;
5. clean consumer fixture, public seam, documentation, and evidence.

The estimate is 6–10 work units because persistence, authorization, audit semantics, and the public
consumer seam are still decisions. No Phase 8 code should be added to the maintenance-only monorepo
package.

### Phase 9 — T1 and one-release compatibility transition

Phase 9 private rehearsal is complete. After approval, the remaining work is expected to be:

1. record package/registry/license/release policy;
2. prepare the exact public artifact and run owner CI;
3. create the approved `v*` tag through the release gate;
4. publish the approved artifact and keep `@oa-sdk/dpm` as the one-release compatibility adapter;
5. add deprecation and rollback evidence for the compatibility release.

The implementation estimate is 3–5 work units, but approval and registry/legal lead time are outside
the estimate and may dominate the calendar.

### Phase 10 — separate external runtime program

Phase 10 is not a backlog item for this repository. A separate owner must define the vault,
tokenization worker, source/target movement, row rewrite, post-run integrity checks, security model,
deployment authority, and operational rollback. No reliable forecast is possible until that program
exists.

## Scenario forecast

| Scenario | What proceeds | Expected work | Gate |
| --- | --- | --- | --- |
| Private maintenance | Checkpoint feedback, compatibility fixes, evidence refreshes | 0–1 unit per focused change | No extra approval |
| Phase 8 activation | Representative control-plane slice | 6–10 units | Explicit owner/product/security activation |
| T1 transition | Public artifact plus one compatibility release | 3–5 units | Issue #2 approval, license/registry decision, exact tag |
| Runtime program | Data-plane production system | Unknown/10+ units | Separate runtime owner and security/deployment contract |

Phase 8 and Phase 9 can proceed as parallel owner-gated branches after Phase 7; neither should be
silently activated by a routine maintenance commit. The current recommended next action is to keep
the Phase 8 proposal reviewable and use the checkpoint/commit loop until an owner activates one of
the gated branches.
