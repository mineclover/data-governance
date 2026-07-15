import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packet = fs.readFileSync(
  path.join(root, 'docs/internal/goals/phase-8-cross-definition-read-model-activation-packet.md'),
  'utf8',
)
const normalizedPacket = packet.replace(/\s+/g, ' ')

const requiredMarkers = [
  '**Status: recommendation prepared; no read-model activation or database deployment authorized**',
  '**Recommended flag state: disabled**',
  'disabled` → `shadow` → `read-only pilot` → approved expansion',
  'read-model-unavailable',
  'deny-by-default',
  'page-size maximum of `100`',
  'backup/restore rehearsal',
  'No PostgreSQL migration',
  'No external OIDC/RBAC integration',
  'No public package metadata, license finalization, registry publication, `v*` tag, or adapter',
]

const missing = requiredMarkers.filter(marker => !normalizedPacket.includes(marker))
if (missing.length > 0) {
  console.error(`Read-model activation packet check failed:\n- ${missing.join('\n- ')}`)
  process.exit(1)
}

if (packet.includes('**Status: active')) {
  console.error('Read-model activation packet must remain recommendation-only')
  process.exit(1)
}

console.log('Read-model activation packet OK: recommendation-only and disabled state are intact')
