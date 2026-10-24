import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import {
  DPM_READ_MODEL_POSTGRES_PROPOSAL_VERSION,
  DPM_READ_MODEL_POSTGRES_SCHEMA_SQL,
  DPM_READ_MODEL_POSTGRES_STATEMENTS,
  DPM_READ_MODEL_POSTGRES_TRANSACTION_RECIPES,
} from '../src/authoring/read-model-postgres-contract.js'

// Structural offline checks only: no SQL parser, database driver, query fake, or PostgreSQL execution.
describe('DPM private read-model PostgreSQL SQL proposal (unexecuted)', () => {
  it('contains declarative constants only and remains outside public/CLI wiring', () => {
    expect(DPM_READ_MODEL_POSTGRES_PROPOSAL_VERSION).toBe('proposal-1')
    const source = readFileSync(new URL('../src/authoring/read-model-postgres-contract.ts', import.meta.url), 'utf8')
    const parsed = ts.createSourceFile('read-model-postgres-contract.ts', source, ts.ScriptTarget.Latest, true)
    expect(parsed.statements.every(statement => ts.isVariableStatement(statement))).toBe(true)
    const calls: ts.Node[] = []
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) || ts.isNewExpression(node) || ts.isTemplateExpression(node)) calls.push(node)
      ts.forEachChild(node, visit)
    }
    visit(parsed)
    expect(calls).toEqual([])

    const paths = [
      '../src/index.ts', '../src/authoring/index.ts',
      ...readdirSync(new URL('../src/public/', import.meta.url)).filter(name => name.endsWith('.ts')).map(name => `../src/public/${name}`),
      ...readdirSync(new URL('../src/cli/', import.meta.url)).filter(name => name.endsWith('.ts')).map(name => `../src/cli/${name}`),
    ]
    for (const path of paths) {
      const content = readFileSync(new URL(path, import.meta.url), 'utf8')
      expect(content).not.toContain('read-model-postgres-contract')
      expect(content).not.toContain('DPM_READ_MODEL_POSTGRES_')
    }
  })

  it('proposes four isolated records with scoped keys and no destructive or privilege SQL', () => {
    const sql = DPM_READ_MODEL_POSTGRES_SCHEMA_SQL
    expect([...sql.matchAll(/create table dpm_read_model\.(\w+)/g)].map(match => match[1])).toEqual([
      'source_expectations', 'build_attempts', 'projected_fields', 'ready_pointers',
    ])
    expect(sql.match(/primary key \(owner_namespace, definition_id/g)).toHaveLength(4)
    expect(sql).toContain('unique (owner_namespace, definition_id, writer_epoch)')
    expect(sql).toContain('primary key (owner_namespace, definition_id, attempt_id, object_id)')
    expect(sql).toContain('foreign key (owner_namespace, definition_id, attempt_id, revision_id, freshness_identity, manifest_identity, writer_epoch)')
    expect(sql).toContain("check (state in ('building', 'ready', 'stale', 'failed'))")
    expect(sql).toContain("projection - array['field', 'identities', 'apiBindings']::text[] = '{}'::jsonb")
    expect(sql).not.toMatch(/\b(drop|truncate|delete|grant|revoke)\b|on delete cascade/i)
    expect(sql).not.toMatch(/\bdpm\.authoring_|\bdefinitions\s+jsonb|\b(password|credential|secret|sample_values)\b/i)
  })

  it.each(Object.entries(DPM_READ_MODEL_POSTGRES_STATEMENTS))(
    '%s uses explicit scoped parameters without identifier interpolation', (_name, statement) => {
      expect(statement.parameters.slice(0, 2)).toEqual(_name === 'readScopeReadiness'
        ? ['ownerNamespace', 'authorizedDefinitionIds']
        : ['ownerNamespace', 'definitionId'])
      const numbers = [...new Set([...statement.sql.matchAll(/\$(\d+)/g)].map(match => Number(match[1])))].sort((a, b) => a - b)
      expect(numbers).toEqual(statement.parameters.map((_, index) => index + 1))
      expect(new Set(statement.parameters).size).toBe(statement.parameters.length)
      expect(statement.sql).not.toContain('${')
      expect(statement.sql).not.toMatch(/\bdpm\.authoring_|\b(drop|truncate|delete|grant|revoke)\b/i)
      if (_name !== 'registerSource') expect(statement.sql).toContain('owner_namespace = $1')
    },
  )

  it('captures source changes and fences source/epoch before inserting an attempt', () => {
    const statements = DPM_READ_MODEL_POSTGRES_STATEMENTS
    expect(statements.registerSource.sql).toContain('writer_epoch = s.writer_epoch + 1')
    expect(statements.registerSource.sql).toContain('is distinct from row(')
    expect(statements.lockSource.sql).toContain('for update')
    expect(statements.advanceEpoch.sql).toContain('and writer_epoch = $6::bigint')
    expect(statements.advanceEpoch.parameters).toEqual([
      'ownerNamespace', 'definitionId', 'revisionId', 'freshnessIdentity', 'manifestIdentity', 'expectedEpoch',
    ])
    expect(statements.insertAttempt.sql).toContain("s.writer_epoch, 'building', s.expected_projection")
    expect(statements.insertAttempt.sql).not.toContain('on conflict')
    expect(DPM_READ_MODEL_POSTGRES_TRANSACTION_RECIPES.begin).toEqual([
      'lockSource', 'findAttempt', 'advanceEpoch', 'insertAttempt',
    ])
  })

  it.each(['stageRow', 'promoteReady', 'failAttempt'] as const)(
    '%s is scoped to the current building attempt and accepted source', name => {
      const sql = DPM_READ_MODEL_POSTGRES_STATEMENTS[name].sql
      expect(sql).toContain('a.owner_namespace = $1 and a.definition_id = $2 and a.attempt_id = $3')
      expect(sql).toContain("a.writer_epoch = $4::bigint and a.writer_epoch = s.writer_epoch and a.state = 'building'")
      expect(sql).toContain('a.revision_id = s.revision_id and a.freshness_identity = s.freshness_identity')
      expect(sql).toContain('a.manifest_identity = s.manifest_identity')
      expect(sql).toContain('a.expected_projection = s.expected_projection')
    },
  )

  it('rejects unknown/changed rows and compares complete sets rather than counts alone', () => {
    const stage = DPM_READ_MODEL_POSTGRES_STATEMENTS.stageRow.sql
    expect(stage).toContain('a.expected_projection ? $5::text')
    expect(stage).toContain('a.expected_projection -> ($5::text) = $6::jsonb')
    expect(stage).not.toContain('on conflict')
    const complete = DPM_READ_MODEL_POSTGRES_STATEMENTS.promoteReady.sql
    expect(complete).toContain('jsonb_each(a.expected_projection) expected')
    expect(complete).toContain('p.object_id = expected.key and p.projection = expected.value')
    expect(complete).toContain('not (a.expected_projection ? p.object_id)')
    expect(complete).not.toMatch(/count\(/i)
  })

  it('pairs ready promotion and pointer change in one lock-first transaction recipe', () => {
    expect(DPM_READ_MODEL_POSTGRES_TRANSACTION_RECIPES.complete).toEqual([
      'lockSource', 'promoteReady', 'setReadyPointer',
    ])
    const sql = DPM_READ_MODEL_POSTGRES_STATEMENTS.setReadyPointer.sql
    expect(sql).toContain("a.writer_epoch = $4::bigint and a.writer_epoch = s.writer_epoch and a.state = 'ready'")
    expect(sql).toContain('a.expected_projection = s.expected_projection')
    expect(sql).toContain('on conflict (owner_namespace, definition_id) do update set')
    expect(sql).toContain('writer_epoch = excluded.writer_epoch')
    expect(DPM_READ_MODEL_POSTGRES_STATEMENTS.failAttempt.sql).not.toContain('ready_pointers')
  })

  it('checks the entire resolved scope in one readiness statement without returning partial hits', () => {
    const { sql, parameters } = DPM_READ_MODEL_POSTGRES_STATEMENTS.readScopeReadiness
    expect(parameters).toEqual(['ownerNamespace', 'authorizedDefinitionIds'])
    expect(sql).toContain('select distinct definition_id from unnest($2::text[])')
    expect(sql).toContain("then 'forbidden'")
    expect(sql).toContain("when exists (select 1 from unavailable) then 'read-model-unavailable'")
    expect(sql).toContain("else 'ready'")
    expect(sql).toContain('a.writer_epoch <> s.writer_epoch or p.writer_epoch <> s.writer_epoch')
    expect(sql).toContain('a.expected_projection <> s.expected_projection')
    expect(sql).toContain('s.definition_id is null or p.attempt_id is null or a.attempt_id is null')
    expect(sql).not.toMatch(/jsonb_agg|\bas hits\b|\bcount\(/i)
  })
})
