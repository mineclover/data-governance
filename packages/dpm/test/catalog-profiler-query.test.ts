import { describe, expect, it } from 'vitest'

import {
  POSTGRES_CATALOG_PROFILE_SQL,
} from '../src/index.js'
import {
  normalizeSql,
  readProfilerPostgresSqlFixture,
} from './support/catalog-profiler-query-fixtures.js'

describe('DPM PostgreSQL catalog profiler query', () => {
  it('defines a read-only PostgreSQL catalog profile query', () => {
    const sql = normalizeSql(POSTGRES_CATALOG_PROFILE_SQL)
    const fixtureSql = normalizeSql(readProfilerPostgresSqlFixture())

    expect(sql).toBe(fixtureSql)
    expect(sql).toContain('pg_catalog.pg_namespace')
    expect(sql).toContain('pg_catalog.pg_class')
    expect(sql).toContain('pg_catalog.pg_attribute')
    expect(sql).toContain('pg_catalog.pg_constraint')
    expect(sql).toContain('pg_catalog.pg_index')
    expect(sql).toContain('pg_catalog.pg_get_expr')
    expect(sql).toContain('n.nspname = any($1::text[])')
    expect(sql).not.toMatch(/\b(insert|update|delete|drop|truncate|alter|create)\b/)
  })
})
