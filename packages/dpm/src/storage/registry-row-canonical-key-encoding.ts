import {
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  resolveDpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import type { DpmRegistryRelationshipRow } from './registry-storage-row-types.js'
import type {
  DpmRegistryCanonicalKeyEncodingContract,
} from './registry-encoding-contract-types.js'

export function resolveDpmRegistryRowCanonicalKeyEncodingVersion(
  row: DpmRegistryRelationshipRow,
): DpmCanonicalKeyEncodingVersion {
  return resolveDpmCanonicalKeyEncodingVersion(
    row.canonicalKeyEncodingVersion,
    `registry row ${row.datasetId}/${row.registryVersion}/${row.relationshipName} canonicalKeyEncodingVersion`,
  )
}

export function resolveDpmRegistryRowsCanonicalKeyEncodingVersion(
  rows: readonly DpmRegistryRelationshipRow[],
): DpmCanonicalKeyEncodingVersion | undefined {
  let selected: DpmCanonicalKeyEncodingVersion | undefined

  for (const row of rows) {
    const current = resolveDpmRegistryRowCanonicalKeyEncodingVersion(row)
    if (selected && selected !== current) {
      throw new Error(
        `DPM registry ${row.datasetId}@${row.registryVersion} mixes canonical key encodings `
        + `${selected} and ${current}.`,
      )
    }
    selected = current
  }

  return selected
}

export function resolveDpmRegistrySnapshotCanonicalKeyEncodingVersion(input: {
  datasetId: string
  registryVersion: string
  expectedCanonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
  registryContract?: DpmRegistryCanonicalKeyEncodingContract
  rows: readonly DpmRegistryRelationshipRow[]
}): DpmCanonicalKeyEncodingVersion {
  const rowEncodingVersion = resolveDpmRegistryRowsCanonicalKeyEncodingVersion(input.rows)
  const contractEncodingVersion = input.registryContract
    ? resolveRegistryContractEncodingVersion(input, input.registryContract)
    : undefined
  if (
    rowEncodingVersion
    && contractEncodingVersion
    && rowEncodingVersion !== contractEncodingVersion
  ) {
    throw new Error(
      `DPM registry ${input.datasetId}@${input.registryVersion} contract stores canonical key encoding `
      + `${contractEncodingVersion}, but relationship rows use ${rowEncodingVersion}.`,
    )
  }
  const stored = contractEncodingVersion
    ?? rowEncodingVersion
    ?? DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION
  const expected = input.expectedCanonicalKeyEncodingVersion === undefined
    ? undefined
    : resolveDpmCanonicalKeyEncodingVersion(
        input.expectedCanonicalKeyEncodingVersion,
        'registry snapshot expectedCanonicalKeyEncodingVersion',
      )

  if (expected && expected !== stored) {
    throw new Error(
      `DPM registry ${input.datasetId}@${input.registryVersion} expected canonical key encoding `
      + `${expected}, but stored rows use ${stored}.`,
    )
  }

  return stored
}

function resolveRegistryContractEncodingVersion(
  input: { datasetId: string; registryVersion: string },
  contract: DpmRegistryCanonicalKeyEncodingContract,
): DpmCanonicalKeyEncodingVersion {
  if (
    contract.datasetId !== input.datasetId
    || contract.registryVersion !== input.registryVersion
  ) {
    throw new Error(
      `DPM registry encoding contract ${contract.datasetId}@${contract.registryVersion} `
      + `does not match requested snapshot ${input.datasetId}@${input.registryVersion}.`,
    )
  }

  return resolveDpmCanonicalKeyEncodingVersion(
    contract.canonicalKeyEncodingVersion,
    'registry contract canonicalKeyEncodingVersion',
  )
}
