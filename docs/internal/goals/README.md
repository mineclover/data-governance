# DPM Owner Goals

→ Progress index: [progress-index.md](./progress-index.md)
→ Owner plan: [../plan.md](../plan.md)

## Scope

This repository owns the extracted DPM contract plane: logical data definitions, explicit
API/catalog bindings, neutral artifacts, compatibility rules, and migration/rollback evidence.
It does not own production tokenization, vault execution, row rewriting, or a public registry
release at this stage.

The repository remains private under the accepted decision in
[owner-decision-record.md](./owner-decision-record.md). Public registry publication is not
authorized.

The formal acceptance review is recorded in the [Goal 68.4 owner acceptance issue](https://github.com/mineclover/data-governance/issues/1);
the structured issue form remains available at `.github/ISSUE_TEMPLATE/dpm-owner-acceptance.yml`.
The `mineclover` repository owner is the release authority; delegated maintainers may prepare
changes but may not unilaterally approve contract/version changes or adapter cutover.

## Current owner goal

| Goal | Status | Package |
|---|---|---|
| [Goal 68 — DPM Logical Data Definition and Extraction Boundary](./goal-68-dpm-logical-data-definition-boundary.md) | Active — private owner acceptance recorded; adapter transition scheduled after the first accepted owner artifact release; public release disabled | `@oa-sdk/dpm` |

## Canonical document set

- [DPM Master Roadmap](./dpm-master-roadmap.md)
- [Goal 68 boundary](./goal-68-dpm-logical-data-definition-boundary.md)
- [Goal 68 migration and rollback contract](./goal-68-dpm-extraction-migration.md)
- [Goal 68.4 acceptance checklist](./goal-68-extraction-acceptance-checklist.md)
- [Private owner decision record](./owner-decision-record.md)
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
corepack pnpm test
corepack pnpm smoke:dpm
```
