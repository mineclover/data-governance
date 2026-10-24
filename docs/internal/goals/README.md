# DPM Owner Documentation

Canonical document index for the Data Pseudonymization Manifest (DPM) contract plane.

→ Repository purpose and scope: [Root README](../../../README.md)
→ Progress index: [progress-index.md](./progress-index.md)
→ Owner plan: [../plan.md](../plan.md)

## Purpose

This document set records what the DPM contract plane owns, how it is governed, and which
decisions are active. It is the canonical source for the extraction contract, compatibility and
migration rules, owner decisions, and the Phase 8 authoring boundary.

The implementation lives in `packages/dpm` and is published as `@oa-sdk/dpm`. Production
tokenization, vault execution, row rewriting, source database mutation, and the Phase 10
data-plane runtime are outside this repository.

## Status

| Item | Status |
| --- | --- |
| Repository | Public |
| Package | `@oa-sdk/dpm@0.1.3` — OIDC-published 2026-10-24, current `latest` |
| Current goal | Goal 68 — DPM logical data definition and extraction boundary |
| Extraction | Complete; `oa-sdk` is a non-publishing compatibility mirror |
| Phase 8 | Representative authoring slice activated; broader control plane deferred |
| Phase 10 | Production data-plane explicitly deferred |
| Release authority | `mineclover` repository owner |

The structured owner acceptance review is [Issue #1](https://github.com/mineclover/data-governance/issues/1);
the T1 publication approval record is [Issue #2](https://github.com/mineclover/data-governance/issues/2),
and the OIDC validation release is [Issue #3](https://github.com/mineclover/data-governance/issues/3).
Delegated maintainers may prepare changes but may not unilaterally approve contract/version
changes or adapter cutover.

## Canonical document set

### Governance and status

- [Owner decision record](./owner-decision-record.md)
- [Progress index](./progress-index.md)
- [Owner plan](../plan.md)
- [Platform scope](../platform-scope.md)

### Roadmap and forecast

- [DPM Master Roadmap](./dpm-master-roadmap.md)
- [Roadmap checkpoint](./roadmap-checkpoint.md)
- [Full phase execution forecast](./full-phase-execution-forecast.md)
- [Phase 8 next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md)

### Goal 68 — extraction boundary

- [Goal 68 boundary](./goal-68-dpm-logical-data-definition-boundary.md)
- [Goal 68 migration and rollback contract](./goal-68-dpm-extraction-migration.md)
- [Goal 68.4 acceptance checklist](./goal-68-extraction-acceptance-checklist.md)

### T1 publication

- [T1 candidate decision packet](./t1-candidate-decision-packet.md)
- [T1 release readiness](./t1-readiness.md)

### Phase 8 — authoring and read model

- [Phase 8 control-plane slice proposal](./phase-8-control-plane-proposal.md)
- [Phase 8 activation decision record](./phase-8-decision-record.md)
- [Phase 8 persistence and identity index proposal](./phase-8-persistence-proposal.md)
- [Phase 8 operational migration packet](./phase-8-operational-migration-packet.md)
- [Phase 8 operational change decision](./phase-8-operational-change-decision.md)
- [Phase 8 local PostgreSQL rehearsal report](./phase-8-local-postgres-rehearsal.md)
- [Phase 8 scoped lookup extension decision](./phase-8-scoped-lookup-decision.md)
- [Phase 8 authoring import/export decision](./phase-8-authoring-import-export-decision.md)
- [Phase 8 authoring explain decision](./phase-8-authoring-explain-decision.md)
- [Phase 8 authoring quick-fix decision](./phase-8-authoring-quick-fix-decision.md)
- [Phase 8 cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md)
- [Phase 8 cross-definition read-model activation packet](./phase-8-cross-definition-read-model-activation-packet.md)
- [Phase 8 cross-definition read-model shadow report](./phase-8-cross-definition-read-model-shadow-report.md)

### Phase 10 — runtime boundary

- [Phase 10 runtime boundary decision](./phase-10-runtime-boundary-decision.md)
- [Phase 10 runtime plan](./phase-10-runtime-plan.md)
- [Phase 10 ownership and threat model](./phase-10-ownership-and-threat-model.md)
- [Phase 10 runtime contract](./phase-10-runtime-contract.md)
- [Phase 10 vault and tokenization design](./phase-10-vault-tokenization-design.md)
- [Phase 10 synthetic rehearsal](./phase-10-synthetic-rehearsal.md)
- [Phase 10 non-production integration plan](./phase-10-non-production-integration-plan.md)
- [Phase 10 non-production rehearsal report](./phase-10-non-production-rehearsal-report.md)
- [Phase 10 canary decision plan](./phase-10-canary-decision-plan.md)
- [Phase 10 production readiness plan](./phase-10-production-readiness-plan.md)
- [Phase 10 controlled execution runbook](./phase-10-controlled-execution-runbook.md)

### TypeSpec logical ERD bridge

- [TypeSpec logical ERD bridge contract](./typespec-logical-erd-bridge-contract.md)
- [TypeSpec logical ERD bridge owner acceptance checklist](./typespec-logical-erd-bridge-acceptance-checklist.md)

### History

- [DPM extraction history](https://github.com/mineclover/oa-sdk/tree/main/docs/internal/goals)

The historical monorepo goals remain in `mineclover/oa-sdk`. This repository carries only the
history needed to review and evolve the DPM contract.

## Verification

Run the owner checks from the repository root:

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm typecheck
corepack pnpm check:boundary
corepack pnpm check:docs
corepack pnpm check:roadmap
corepack pnpm test
corepack pnpm smoke:dpm
```
