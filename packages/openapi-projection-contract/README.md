# OpenAPI Projection Contract

`@oa-sdk/openapi-projection-contract` defines the source-agnostic envelope shared by OpenAPI projection adapters. The contract describes projected OpenAPI artifacts, profile semantics, refs, diagnostics, source coordinates, version hashes, and optional type targets. It does not load files, query databases, run CLIs, or import OA SDK parser/codegen internals or bun-graph-db runtime code.

## Projection Profiles

| Profile | Paths rule | Components rule | Validation rule |
|---|---|---|---|
| `component-bundle` | `paths` may be absent or empty. | `components.schemas` is required. | Profile-aware validation should allow the empty-path component bundle shape while requiring reusable schemas. |
| `operation-contract` | `paths` must contain at least one operation under a path item. | `components.schemas` is optional unless referenced by operations. | Profile-aware validation should combine normal OpenAPI checks with the operation requirement. |
| `full-api-document` | Uses normal OpenAPI document rules. | Uses normal OpenAPI document rules. | Host validators should apply normal OpenAPI validation; this package performs dependency-light structural checks only. |

The profile names are exported through `OPENAPI_PROJECTION_PROFILES`, runtime profile checks use `isOpenApiProjectionProfile()`, and shape rules are exported through `OPENAPI_PROJECTION_PROFILE_SEMANTICS`.

## Projection Metadata Extensions

Projection metadata that describes the emitted artifact, rather than the API contract itself, belongs in root-level OpenAPI extension fields:

| Extension | Source envelope field | Purpose |
|---|---|---|
| `x-schema-engine-profile` | `profile` | Identifies whether the serialized document is a `component-bundle`, `operation-contract`, or `full-api-document`. |
| `x-schema-engine-version-hash` | `versionHash` | Preserves the projection freshness/content hash used by the producer. |
| `x-schema-engine-sources` | `sources` | Preserves source coordinates keyed by producer-defined ids, including file path, JSON Pointer, optional line/column, or DB entity/id/pointer coordinates. |
| `x-schema-engine-refs` | `refs` | Preserves the source ref graph edges, raw ref text, optional resolved target id, edge kind, and source coordinate. |

The extension names are exported as `OPENAPI_PROJECTION_PROFILE_EXTENSION`, `OPENAPI_PROJECTION_VERSION_HASH_EXTENSION`, `OPENAPI_PROJECTION_SOURCES_EXTENSION`, `OPENAPI_PROJECTION_REFS_EXTENSION`, and the ordered tuple `OPENAPI_PROJECTION_EXTENSION_NAMES`.

Use `serializeOpenApiProjectionExtensions(result)` when a caller needs only the metadata extension object, or `attachOpenApiProjectionExtensions(result)` when a caller needs the OpenAPI document with those root-level `x-*` fields applied. The helpers copy source and ref records so file coordinates, DB coordinates, and ref graph metadata survive JSON/YAML serialization without sharing mutable references with the envelope.

Standard OpenAPI fields remain responsible for the API artifact itself: `openapi`, `info`, `servers`, `paths`, `webhooks`, `components`, `security`, `tags`, `externalDocs`, `jsonSchemaDialect`, normal component schemas, and normal `$ref` values. Projection-only provenance and freshness data should not be encoded into standard OpenAPI fields. Diagnostics and `typeTargets` stay in the sidecar envelope until a future story defines stable OpenAPI extensions for them.

## Validation

`validateOpenApiProjection(result)` is the shared dependency-light validation entrypoint. It accepts unknown input, returns `SchemaValidateResult`, and reports ordinary invalid projection data as structured diagnostics instead of throwing.

The built-in OpenAPI check is intentionally structural rather than a broad spec engine. It verifies the document object, OpenAPI 3.x version marker, required `info.title` and `info.version`, `paths` shape, operation `responses`, and `components.schemas` shape. Profile-aware rules then require `components.schemas` for `component-bundle`, require at least one operation for `operation-contract`, and require a normal `paths` object for `full-api-document`.

Envelope validation also checks required ref fields, diagnostic severity/code/message fields, supported file or DB source coordinate variants, version hash presence, and optional type target metadata. Any existing projection diagnostic with `severity: "error"` makes the returned validation result invalid.

This validator does not read files, query repositories, open SQLite, construct MCP servers, execute GraphQL, or import OA SDK parser/codegen internals. Callers that need full OpenAPI conformance validation should run their own source-specific validator before or after this shared contract check and map results into `diagnostics`.

## First Emitters

OA SDK should emit `full-api-document` first because Definition Builder already materializes complete OpenAPI 3.2 documents from file-backed definition fragments.

bun-graph-db should emit `component-bundle` first because table metadata already maps cleanly to reusable schemas. `operation-contract` should follow when create/update node operations are represented as OpenAPI request contracts. bun-graph-db should only emit `full-api-document` after it has a complete API document surface rather than table-scoped schema material.

These recommendations are migration order guidance only. Profile semantics are based on the emitted OpenAPI projection shape, not on which system produced it.
