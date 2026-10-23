# DPM Owner Goals

→ Progress index: [progress-index.md](./progress-index.md)
→ Owner plan: [../plan.md](../plan.md)

## Scope

This repository owns the extracted DPM contract plane: logical data definitions, explicit
API/catalog bindings, neutral artifacts, compatibility rules, and migration/rollback evidence.
It does not own production tokenization, vault execution, or row rewriting.

The repository is public under the accepted decision in
[owner-decision-record.md](./owner-decision-record.md). The selected public package target is
`@oa-sdk/dpm`; `0.1.2` was published on 2026-07-28 and is the current `latest`. Future registry
releases run through the exact `v*` release gate.

The formal acceptance review is recorded in the [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1);
the structured issue form remains available at `.github/ISSUE_TEMPLATE/dpm-owner-acceptance.yml`.
The `mineclover` repository owner is the release authority; delegated maintainers may prepare
changes but may not unilaterally approve contract/version changes or adapter cutover.

## Current owner goal

| Goal | Status | Package |
|---|---|---|
| [Goal 68 — DPM Logical Data Definition and Extraction Boundary](./goal-68-dpm-logical-data-definition-boundary.md) | Active — `@oa-sdk/dpm@0.1.2` published 2026-07-28; existing imports remain unchanged | `@oa-sdk/dpm` |

## Canonical document set

- [DPM Master Roadmap](./dpm-master-roadmap.md)
- [Roadmap checkpoint](./roadmap-checkpoint.md)
- [Full phase execution forecast](./full-phase-execution-forecast.md)
- [Phase 8 control-plane slice proposal](./phase-8-control-plane-proposal.md)
- [Phase 8 private activation decision record](./phase-8-decision-record.md)
- [Phase 8 persistence and identity index proposal](./phase-8-persistence-proposal.md)
- [Phase 8 operational migration packet](./phase-8-operational-migration-packet.md)
- [Phase 8 operational change decision](./phase-8-operational-change-decision.md)
- [Phase 8 local PostgreSQL rehearsal report](./phase-8-local-postgres-rehearsal.md)
- [Phase 8 scoped lookup extension decision](./phase-8-scoped-lookup-decision.md)
- [Phase 8 authoring import/export decision](./phase-8-authoring-import-export-decision.md)
- [Phase 8 authoring explain decision](./phase-8-authoring-explain-decision.md)
- [Phase 8 authoring quick-fix decision](./phase-8-authoring-quick-fix-decision.md)
- [TypeSpec logical ERD bridge contract](./typespec-logical-erd-bridge-contract.md)
- [TypeSpec logical ERD bridge owner acceptance checklist](./typespec-logical-erd-bridge-acceptance-checklist.md)
- [Phase 8 next follow-on priority decision](./phase-8-next-follow-on-priority-decision.md)
- [Phase 8 cross-definition read-model contract](./phase-8-cross-definition-read-model-contract.md)
- [Phase 8 cross-definition read-model activation packet](./phase-8-cross-definition-read-model-activation-packet.md)
- [T1 candidate decision packet](./t1-candidate-decision-packet.md)
- [Goal 68 boundary](./goal-68-dpm-logical-data-definition-boundary.md)
- [Goal 68 migration and rollback contract](./goal-68-dpm-extraction-migration.md)
- [Goal 68.4 acceptance checklist](./goal-68-extraction-acceptance-checklist.md)
- [Owner decision record](./owner-decision-record.md)
- [Progress index](./progress-index.md)
- [Owner plan](../plan.md)

## Historical baseline

The completed monorepo implementation history remains in
[mineclover/oa-sdk](https://github.com/mineclover/oa-sdk). This repository carries only the
history needed to review the DPM extraction boundary and does not mirror unrelated repository
goals.

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
