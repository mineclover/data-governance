import { describe, expect, it } from 'vitest'

import {
  createDpmAuthoringQuickFixes,
  createDpmAuthoringSemanticDiff,
  createDpmIdentityDataDefinitions,
  type DpmAuthoringDraft,
  type DpmAuthoringPublishedRevision,
} from '../src/index.js'

describe('DPM authoring quick-fix helper', () => {
  it('turns breaking changes into approval-required review suggestions without raw payloads', () => {
    const diff = createDiff(createDefinitions({ type: 'number' }))
    const fixes = createDpmAuthoringQuickFixes(diff)

    expect(fixes).toEqual([{
      definitionId: 'customer-definition',
      baseRevisionId: 'revision-1',
      draftId: 'draft-1',
      kind: 'review-breaking-change',
      identity: 'data-field:customer-number',
      sourceChangeKind: 'field.changed',
      breaking: true,
      summary: 'Review breaking field.changed for data-field:customer-number before publish.',
      requiresApproval: true,
      autoApplicable: false,
    }])
    expect(fixes[0]).not.toHaveProperty('before')
    expect(fixes[0]).not.toHaveProperty('after')
    expect(Object.isFrozen(fixes)).toBe(true)
    expect(Object.isFrozen(fixes[0])).toBe(true)
  })

  it('identifies alias-preserved renames and deprecation transitions', () => {
    const renameDiff = createDiff(createDefinitions({
      name: 'customerNumber',
      aliases: ['field:commerce/customer/customer/customerNo'],
    }))
    const deprecationDiff = createDiff(createDefinitions({ lifecycle: 'deprecated' }))

    expect(createDpmAuthoringQuickFixes(renameDiff)).toMatchObject([{
      kind: 'confirm-rename-alias',
      breaking: false,
      requiresApproval: true,
      autoApplicable: false,
    }])
    expect(createDpmAuthoringQuickFixes(deprecationDiff)).toMatchObject([{
      kind: 'confirm-deprecation',
      breaking: false,
      requiresApproval: true,
      autoApplicable: false,
    }])
  })

  it('does not invent actions for non-breaking changes outside the adopted rules', () => {
    const diff = createDiff(createDefinitions({ description: 'updated description' }))
    expect(createDpmAuthoringQuickFixes(diff)).toEqual([])
  })
})

function createDiff(definitions: ReturnType<typeof createDefinitions>) {
  const base: DpmAuthoringPublishedRevision = {
    definitionId: 'customer-definition',
    revisionId: 'revision-1',
    definitions: createDefinitions({}),
    reason: 'initial',
    createdBy: 'owner',
    createdAt: '2026-07-15T00:00:00.000Z',
  }
  const draft: DpmAuthoringDraft = {
    definitionId: 'customer-definition',
    draftId: 'draft-1',
    baseRevisionId: 'revision-1',
    definitions,
    status: 'draft',
    createdBy: 'editor',
    createdAt: '2026-07-15T00:01:00.000Z',
  }
  return createDpmAuthoringSemanticDiff(base, draft)
}

function createDefinitions(overrides: {
  aliases?: string[]
  description?: string
  lifecycle?: 'active' | 'deprecated'
  name?: string
  type?: 'number' | 'string'
}) {
  return createDpmIdentityDataDefinitions({
    version: '1.1',
    fields: [{
      objectId: 'customer-number',
      revisionId: 'customer-number-rev-1',
      entity: { datasetId: 'commerce', namespace: 'customer', name: 'customer' },
      name: overrides.name ?? 'customerNo',
      type: overrides.type ?? 'string',
      origin: 'persisted',
      ...(overrides.aliases === undefined ? {} : { aliases: overrides.aliases }),
      ...(overrides.description === undefined ? {} : { description: overrides.description }),
      ...(overrides.lifecycle === undefined ? {} : { lifecycle: overrides.lifecycle }),
      storageRef: {
        table: 'public.customers',
        column: 'customer_no',
        catalog: { snapshotId: 'commerce-catalog-1', versionHash: 'sha256:catalog-1' },
      },
    }],
    apiBindings: [{
      bindingId: 'customer-number-response',
      dataField: { objectId: 'customer-number', revisionId: 'customer-number-rev-1' },
      api: {
        artifactId: 'commerce-api',
        pointer: '#/components/schemas/Customer/properties/customerNo',
        versionHash: 'sha256:api-1',
      },
      direction: 'response',
    }],
  })
}
