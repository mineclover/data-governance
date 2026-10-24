import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'

const fixture = (name: string) => new URL(`./fixtures/authoring/${name}`, import.meta.url).pathname
const beforePath = fixture('customer-before-revision.json')
const afterPath = fixture('customer-after-draft.json')

describe('DPM CLI authoring commands', () => {
  it('inspects identity-only revision readback', async () => {
    const result = await runDpmCli([
      'authoring',
      'inspect',
      '--revision',
      beforePath,
      '--format',
      'text',
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('command: authoring-inspect')
    expect(result.stdout).toContain('documentKind: published-revision')
    expect(result.stdout).toContain('fieldCount: 1')
    expect(result.stdout).toContain('apiBindingCount: 0')
  })

  it('rejects ambiguous inspect inputs', async () => {
    const result = await runDpmCli([
      'authoring',
      'inspect',
      '--revision',
      beforePath,
      '--draft',
      afterPath,
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toBe('Authoring inspect requires exactly one of --revision or --draft\n')
  })

  it('returns semantic changes and approval diagnostics for diff', async () => {
    const result = await runDpmCli(['authoring', 'diff', '--before', beforePath, '--after', afterPath])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('authoring-diff')
    expect(output.result.breaking).toBe(true)
    expect(output.result.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'field.changed', breaking: true }),
    ]))
    expect(output.result.diagnostics[0].requiresApproval).toBe(true)
    expect(output.result.quickFixes[0].autoApplicable).toBe(false)
  })

  it('searches only explicitly supplied published revisions with bounded pagination', async () => {
    const result = await runDpmCli([
      'authoring',
      'search',
      '--revision',
      beforePath,
      '--revision',
      fixture('billing-revision.json'),
      '--field-name',
      'customerNo',
      '--page-size',
      '1',
    ])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('authoring-search')
    expect(output.result.status).toBe('ready')
    expect(output.result.hits).toHaveLength(1)
    expect(output.result.nextCursor).toBeDefined()
  })

  it('prepares an approval-gated apply plan without mutation', async () => {
    const result = await runDpmCli([
      'authoring',
      'apply-plan',
      '--before',
      beforePath,
      '--after',
      afterPath,
      '--format',
      'text',
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('command: authoring-apply-plan')
    expect(result.stdout).toContain('mutation: none')
    expect(result.stdout).toContain('executable: false')
    expect(result.stdout).toContain('steps: 6')

    const jsonResult = await runDpmCli([
      'authoring',
      'apply-plan',
      '--before',
      beforePath,
      '--after',
      afterPath,
    ])
    const output = JSON.parse(jsonResult.stdout)
    expect(output.result.authorization.defaultDeny).toBe(true)
    expect(output.result.concurrency.staleBaseMustBeRejected).toBe(true)
    expect(output.result.idempotency.duplicateRequestReturnsOriginalOutcome).toBe(true)
    expect(output.result.persistence.atomicAuditWithPublication).toBe(true)
    expect(output.result.dryRun.default).toBe(true)
    expect(output.result.rollback.targetRetentionRequired).toBe(true)
  })

  it('reads and filters file-based authoring audit events', async () => {
    const result = await runDpmCli([
      'authoring',
      'audit',
      '--events',
      fixture('audit-events.json'),
      '--definition-id',
      'customer-definition',
      '--format',
      'text',
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('command: authoring-audit')
    expect(result.stdout).toContain('eventCount: 3')
    expect(result.stdout).toContain('chronological: true')
  })

  it('validates revision artifacts without mutation', async () => {
    const result = await runDpmCli([
      'authoring',
      'validate',
      '--revision',
      beforePath,
    ])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('authoring-validate')
    expect(output.result.valid).toBe(true)
    expect(output.result.documentKind).toBe('published-revision')
  })

  it('rejects ambiguous validation artifact inputs', async () => {
    const result = await runDpmCli([
      'authoring',
      'validate',
      '--revision',
      beforePath,
      '--events',
      fixture('audit-events.json'),
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toBe('Authoring validate requires exactly one of --revision, --draft, or --events\n')
  })

  it('rejects non-chronological audit snapshots in validation mode', async () => {
    const result = await runDpmCli([
      'authoring',
      'validate',
      '--events',
      fixture('audit-events-out-of-order.json'),
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('audit events must be in chronological order')
  })

  it('rejects malformed audit snapshots', async () => {
    const result = await runDpmCli([
      'authoring',
      'audit',
      '--events',
      fixture('customer-after-draft.json'),
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('expected an audit event array')
  })

  it('fails closed when offline search lacks freshness evidence', async () => {
    const result = await runDpmCli([
      'authoring',
      'search',
      '--revision',
      fixture('customer-current-revision.json'),
      '--field-name',
      'customerNo',
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('source.freshnessIdentity is required for offline search')
  })

  it('renders a concise review in text mode without raw payloads', async () => {
    const result = await runDpmCli([
      'authoring',
      'review',
      '--before',
      beforePath,
      '--after',
      afterPath,
      '--format',
      'text',
    ])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('command: authoring-review')
    expect(result.stdout).toContain('approvalRequired: true')
    expect(result.stdout).toContain('quickFixes: 1')
    expect(result.stdout).not.toContain('"before"')
  })

  it('plans rollback without mutating revisions', async () => {
    const result = await runDpmCli([
      'authoring',
      'rollback-plan',
      '--current',
      fixture('customer-current-revision.json'),
      '--target',
      fixture('customer-target-revision.json'),
    ])
    const output = JSON.parse(result.stdout)

    expect(result.exitCode).toBe(0)
    expect(output.command).toBe('authoring-rollback-plan')
    expect(output.result.action).toBe('rollback')
    expect(output.result.mutation).toBe('none')
    expect(output.result.approvalRequired).toBe(true)
  })

  it('rejects mismatched authoring base revisions', async () => {
    const result = await runDpmCli([
      'authoring',
      'diff',
      '--before',
      beforePath,
      '--after',
      fixture('customer-current-revision.json'),
    ])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('Invalid authoring document')
  })

  it('rejects unknown authoring options', async () => {
    const result = await runDpmCli(['authoring', 'diff', '--before', beforePath, '--after', afterPath, '--publish'])

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toBe('Unknown option --publish\n')
  })
})
