import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
)

const packResult = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
)

const files = new Set(packResult[0].files.map(file => file.path))
const expectedFiles = new Set([
  'package.json',
  'README.md',
])

for (const exported of Object.values(manifest.exports)) {
  expectedFiles.add(stripRelativePrefix(exported.import))
  expectedFiles.add(stripRelativePrefix(exported.types))
}

for (const binPath of Object.values(manifest.bin ?? {})) {
  expectedFiles.add(stripRelativePrefix(binPath))
}

const missingFiles = [...expectedFiles].filter(file => !files.has(file))
const invalidFiles = [...files].filter(file =>
  file !== 'package.json'
  && file !== 'README.md'
  && !file.startsWith('dist/')
)

if (files.has('dist/stale-pack-boundary.txt')) {
  throw new Error('DPM pack smoke found stale dist sentinel in package dry-run output')
}

if (missingFiles.length > 0) {
  throw new Error(`DPM pack smoke is missing expected files: ${missingFiles.join(', ')}`)
}

if (invalidFiles.length > 0) {
  throw new Error(`DPM pack smoke found files outside package boundary: ${invalidFiles.join(', ')}`)
}

console.log(`DPM pack dry-run OK: ${files.size} files`)

function stripRelativePrefix(path) {
  return path.startsWith('./') ? path.slice(2) : path
}
