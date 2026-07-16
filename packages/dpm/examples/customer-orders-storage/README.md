# DPM Customer Orders Storage Demo

This demo shows the storage-backed DPM loop with fixture-backed storage adapters:

```text
PostgreSQL catalog profile rows + relationship registry rows + manifest
  -> catalog profiler
  -> registry schema bootstrap
  -> Postgres registry storage adapter
  -> registry snapshot export + approval audit timeline read
  -> validate
  -> compile
  -> dry-run
  -> job/report persistence
  -> gateway-compatible report retrieval
```

Run it from the repository root:

```bash
pnpm demo:dpm:storage
```

Or from this package:

```bash
pnpm --filter @context-action/dpm run demo:storage
```

The demo is CI-reproducible and does not require a live database. It uses checked-in
`catalog-profile-rows.json` as the output of the read-only PostgreSQL catalog profiler and
`relationship-registry-rows.json` plus `relationship-registry-audit-events.json` as the durable
registry storage fixture. A fixture query client returns Postgres-shaped rows through
`applyDpmRegistryStorageSchema()` and `createDpmPostgresRegistryStorage()` so the demo exercises
the same bootstrap and adapter boundary that a product service would bind to its own database
client.

The smoke output proves:

- catalog profiling uses an explicit read-only query client,
- registry schema bootstrap applies the canonical DPM registry schema blocks,
- approved registry rows export to the existing registry snapshot contract through the Postgres
  registry storage adapter,
- approval audit events read back through the same adapter boundary,
- validate, compile, and dry-run run from storage-backed inputs,
- job/report repositories persist diagnostics, plan identity, freshness, and impact summaries,
- report retrieval returns the gateway-compatible job report shape,
- no source DB mutation, source credentials, vault material, reverse lookup maps, or raw sensitive
  values are persisted.
