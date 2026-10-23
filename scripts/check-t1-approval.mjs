import { readFileSync } from 'node:fs'

const body = readFileSync(0, 'utf8')
const releaseVersion = process.argv[2] ?? process.env.RELEASE_VERSION
if (!/^\d+\.\d+\.\d+$/.test(releaseVersion ?? '')) {
  console.error('T1 owner approval check failed: a release version is required')
  process.exit(1)
}

const requiredApprovalRows = [
  'Package identity, registry scope, and publication target approved',
  'License and redistribution policy approved',
  `\`v${releaseVersion}\` release reference approved`,
  'Package continuity, rollback, and non-publishing mirror policy approved',
  'Explicit approval recorded by the repository owner or delegated release authority',
  'I approve creating the exact release reference above and proceeding through the T1 release gate',
]

const missing = requiredApprovalRows
  .filter(row => !body.includes(`- [x] ${row}`))

if (missing.length > 0) {
  console.error(`T1 owner approval check failed: v${releaseVersion} approval is not fully approved`)
  for (const row of missing) console.error(`- missing checked approval: ${row}`)
  process.exit(1)
}

console.log(`T1 owner approval OK: v${releaseVersion} records all required approvals`)
