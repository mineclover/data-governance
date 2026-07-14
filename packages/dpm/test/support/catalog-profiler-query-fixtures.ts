import {
  readDpmTextFixture,
} from './fixture-io.js'

export function readProfilerPostgresSqlFixture(): string {
  return readDpmTextFixture('catalog/profiler-postgres.sql')
}

export function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim().toLowerCase()
}
