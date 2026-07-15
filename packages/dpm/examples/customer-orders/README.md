# DPM Customer Orders Demo

This demo shows the primary DPM loop without connecting to a source database:

```text
catalog snapshot + relationship registry + manifest
  -> oa-dpm validate
  -> oa-dpm compile
  -> oa-dpm dry-run
```

Run it from the repository root:

```bash
pnpm demo:dpm
```

Or from this package:

```bash
pnpm --filter @mineclover/dpm run demo
```

The demo proves:

- the manifest passes the JSON Schema gate and semantic validator,
- the compiler uses the approved relationship registry snapshot,
- the dry-run report includes impact counts without raw sensitive values,
- malformed manifests fail with `SYN001`,
- spoofed approved relationships fail with `REL013`,
- missing column relationship references fail with `SAF012`.

The example intentionally uses `catalog.snapshot.json` instead of live DB credentials. That keeps
the DPM policy loop focused on logical data contracts and avoids source DB mutation.

For the storage-backed profiler/registry/job/report flow, run:

```bash
pnpm demo:dpm:storage
```
