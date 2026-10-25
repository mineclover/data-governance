# DPM Full Phase Execution Forecast

**Status: private Phase 8 representative slice active; no public release authorization**
**Updated: 2026-10-25**

**Current priority amendment:** [always-on/shared search is deferred TODO](./shared-search-todo.md).
The forecast baseline below originated on 2026-07-15 and is not the current execution queue or
release status; use the roadmap checkpoint/handoff for current evidence. No active DB/shared-search
implementation units are assigned. Today's file-based CLI requires no DB or hosted service.

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
| 0 | Governance and ownership | Complete; owner accepted | Routine checkpoint/evidence maintenance | 0–1 maintenance units | High |
| 1 | Relationship contract | Complete and tested | Compatibility maintenance only | 0–1 maintenance units | High |
| 2 | Evidence and proposal | Complete and tested | Compatibility maintenance only | 0–1 maintenance units | High |
| 3 | Approval and durability | Complete within boundary | Compatibility maintenance only | 0–1 maintenance units | High |
| 4 | Public package contract | Complete; `@oa-sdk/dpm@0.1.2` published | Compatibility and release maintenance | 0–1 maintenance units | High |
| 5 | Logical identity and wire contract | Complete and accepted privately | Future owner-authorized wire revisions only | 0–2 extension units | High |
| 6 | Cross-object semantic binding | Complete and accepted privately | Future owner-authorized diagnostics/read-model consumers | 0–2 extension units | High |
| 7 | Neutral artifact and provenance | Complete and accepted privately | Feed the Phase 8 slice and extraction compatibility | 0–2 extension units | High |
| 8 | Search, edit, authoring control plane | Definition-scoped slice, canonical import/export, identity-only explain, semantic-diff quick-fix suggestions, cross-definition entry contract, and private conformance fixture prepared | Runtime read-model activation, automatic mutation, bulk edit, and broader authoring decisions | 0–2 extension units | Medium |
| 9 | External extraction and compatibility transition | Initial extraction and `v0.1.2` public release complete; mirror adapter transition remains owner-controlled | Compatibility maintenance and any separately approved adapter cutover | 0–2 maintenance units | Medium |
| 10 | Production data-plane runtime | Design-only preparation authorized; execution deferred | Separate runtime owner/security/deployment program and all Phase 10 gates | Not estimable; likely 10+ units | Low |

## Phase detail and exit criteria

### Phases 0–4 — completed foundation and T1 preparation

The relationship-first contract, evidence/proposal workflows, approval/durability boundary, package
subpaths, consumer smokes, private extraction, and owner governance are complete. The only active
follow-up is maintenance plus the T1 decision packet:

- confirm package identity and public registry target;
- select and approve license/redistribution policy;
- confirm the first release reference;
- run owner CI for the selected private source ref and obtain explicit owner approval.

Until those decisions are complete, Phase 4 remains private and no T1 tag or public metadata is
created.

### Phases 5–7 — accepted contract plane

The identity, semantic binding, neutral artifact, freshness, provenance, and rollback contracts are
implemented and privately accepted. Their remaining forecast is maintenance or owner-authorized
extension only; they are not a reason to reopen the completed contract goals.

### Phase 8 — scoped representative slice and follow-ons

The activated [Phase 8 control-plane slice](./phase-8-decision-record.md) is implemented through the
definition-scoped [lookup extension](./phase-8-scoped-lookup-decision.md):

1. exact logical/API/DB identity lookup;
2. entity/locator/name/type/origin/lifecycle field filters;
3. deterministic canonical `data_definitions` `1.1` import/export;
4. identity-only logical/API/DB explain output;
5. semantic-diff quick-fix suggestions for breaking review, alias-preserved rename, and deprecation;
6. immutable published revision and draft/base-revision concurrency;
7. validate-preview, semantic diff, breaking classification, approval, publish, audit readback, and rollback;
8. clean consumer fixture, public seam, documentation, and evidence.

Conditional future follow-ons are ordered by the [Phase 8 next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md):
shared cross-definition service before automatic mutation and bulk edit, if explicitly reopened.
The shared-service feature is currently parked as TODO, not the next implementation task. The
cross-definition entry contract is prepared, but durable persistence, external authorization, and
runtime activation remain separate gates. No Phase 8 code should be added to the historical
`oa-sdk` mirror.

### Phase 9 — T1 and package continuity

Phase 9 private rehearsal is complete. After approval, the remaining work is expected to be:

1. record package/registry/license/release policy;
2. prepare the exact public artifact and run owner CI;
3. create the approved `v*` tag through the release gate;
4. publish the approved `@oa-sdk/dpm` artifact through Trusted Publishing;
5. retain the historical `oa-sdk` repository as a non-publishing mirror and verify package continuity.

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
| Phase 8 activation | Representative control-plane slice | 6–10 units | [Private activation decision record](./phase-8-decision-record.md) |
| T1 transition | Public artifact and matching GitHub Release complete | Completed | Issue #2 approval, license/registry decision, exact `v0.1.2` tag |
| Runtime program | Data-plane production system | Unknown/10+ units | Separate runtime owner and security/deployment contract |

Phase 8 and Phase 9 remain separate branches after Phase 7. Phase 8 is active only within the
representative slice decision above; the initial Phase 9 extraction and public release are complete.
Any mirror adapter cutover or broader compatibility transition still requires the owner-approved
release gate. Continue using the checkpoint/commit loop for each work unit.
