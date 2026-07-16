# DPM Kafka Profile Demo

This demo shows the profile-first DPM loop without connecting to Kafka:

```text
Captured Kafka topic bundle fixture
  -> profileKafkaTopic
  -> createDpmProfileArtifactSnapshot
  -> gateway inspect profile
  -> gateway analyze profile
  -> store previous profile baseline
  -> gateway list body-free baseline summaries
  -> gateway select latest previous baseline and compare previous/current profile
  -> gateway review relationship hint proposal
  -> bridge reviewer-mapped relationship hint into candidate import review
  -> approve candidate, persist registry row, and export registry snapshot
```

Run it from the repository root:

```bash
pnpm demo:dpm:profile
```

Or from this package:

```bash
pnpm --filter @context-action/dpm run demo:profile
```

The demo proves:

- Captured Kafka topic, key, header, schema, nested message field, metric, and relationship hint evidence is flattened into a DPM profile artifact.
- Connector and profile artifact validation pass without live Kafka access.
- SDK consumers can create a frozen read-only profile artifact snapshot for editor baselines.
- Gateway inspection returns profile counts for editor use.
- Profile analysis emits relationship hint proposals, key candidates, risk indicators, and coverage metrics.
- Profile analysis lists body-free baseline history summaries through the gateway, selects the latest stored previous measurement baseline, preserves measurement id/run metadata, compares it with the current artifact, and emits drift signals.
- Proposal review can accept or request changes on hints without mutating connector evidence.
- Reviewer-mapped profile relationship hints can be bridged into non-executable relationship candidate import review.
- Approved relationship candidates can be persisted as registry rows and exported as executable registry snapshots without live Kafka or source DB access.
- A mismatched proposal review is rejected with `PROF201`.
- Runtime profile snapshots are defensive copies.

The checked-in fixture intentionally contains only captured shape and metric evidence. It does not
contain message payload samples, source credentials, or token reverse lookup material.
