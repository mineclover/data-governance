import { readFileSync } from 'node:fs'

const body = readFileSync(0, 'utf8')
const requiredApprovalRows = [
  'Package identity, registry scope, and publication target approved',
  'License and redistribution policy approved',
  '`v0.1.2` release reference approved',
  'Package continuity, rollback, and non-publishing mirror policy approved',
  'Explicit approval recorded by the repository owner or delegated release authority',
  'I approve creating the exact release reference above and proceeding through the T1 release gate',
]

const missing = requiredApprovalRows
  .filter(row => !body.includes(`- [x] ${row}`))

if (missing.length > 0) {
  console.error('T1 owner approval check failed: Issue #2 is not fully approved')
  for (const row of missing) console.error(`- missing checked approval: ${row}`)
  process.exit(1)
}

console.log('T1 owner approval OK: Issue #2 records all required approvals')
