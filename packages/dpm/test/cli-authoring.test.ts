import { describe, expect, it } from 'vitest'

import { runDpmCli } from '../src/cli/index.js'

const fixture = (name: string) => new URL(`./fixtures/authoring/${name}`, import.meta.url).pathname
const beforePath = fixture('customer-before-revision.json')
const afterPath = fixture('customer-after-draft.json')

describe('DPM CLI authoring commands', () => {
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
