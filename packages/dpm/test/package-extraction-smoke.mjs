import { execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdtempSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = fileURLToPath(new URL('..', import.meta.url))
const fixturePath = fileURLToPath(new URL('./external-consumer-fixture.mjs', import.meta.url))
const authoringFixturePath = fileURLToPath(new URL('./external-consumer-authoring-fixture.mjs', import.meta.url))
const authoringReviewFixturePath = fileURLToPath(new URL('./external-consumer-authoring-review-fixture.mjs', import.meta.url))
const rollbackFixturePath = fileURLToPath(new URL('./external-consumer-rollback-fixture.mjs', import.meta.url))
const typeFixturePath = fileURLToPath(new URL('./external-consumer-type-fixture.ts', import.meta.url))
const tscPath = fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url))
const manifestFixturePath = fileURLToPath(new URL('./fixtures/valid/customer-orders.json', import.meta.url))
const catalogFixturePath = fileURLToPath(new URL('./fixtures/catalog/postgres-commerce.json', import.meta.url))
const registryFixturePath = fileURLToPath(new URL('./fixtures/registry/commerce-registry.yaml', import.meta.url))
const tempDir = mkdtempSync(join(tmpdir(), 'oa-sdk-dpm-extraction-'))
const packageArchiveDir = join(tempDir, 'archive')
const packedPackageDir = join(tempDir, 'packed-package')
const consumerDir = join(tempDir, 'consumer')
const packageInstallDir = join(consumerDir, 'node_modules', '@oa-sdk', 'dpm')

try {
  mkdirSync(packageArchiveDir, { recursive: true })
  mkdirSync(packedPackageDir, { recursive: true })
  const packResult = JSON.parse(execFileSync('npm', [
    'pack',
    '--json',
    '--pack-destination',
    packageArchiveDir,
  ], {
    cwd: packageDir,
    encoding: 'utf8',
  }))
  const archiveName = packResult[0]?.filename
  if (!archiveName) throw new Error('npm pack did not return an archive filename')

  execFileSync('tar', [
    '-xzf',
    join(packageArchiveDir, archiveName),
    '--strip-components=1',
    '-C',
    packedPackageDir,
  ])
  execFileSync('corepack', [
    'pnpm',
    'deploy',
    '--legacy',
    '--filter',
    '@context-action/dpm',
    '--prod',
    consumerDir,
  ], {
    cwd: packageDir,
    stdio: 'ignore',
  })
  rmSync(join(consumerDir, 'dist'), { recursive: true, force: true })
  cpSync(join(packedPackageDir, 'dist'), join(consumerDir, 'dist'), { recursive: true })
  copyFileSync(join(packedPackageDir, 'package.json'), join(consumerDir, 'package.json'))
  copyFileSync(join(packedPackageDir, 'README.md'), join(consumerDir, 'README.md'))
  mkdirSync(join(consumerDir, 'node_modules', '@oa-sdk'), { recursive: true })
  rmSync(packageInstallDir, { recursive: true, force: true })
  symlinkSync('../../..', packageInstallDir, 'dir')
  copyFileSync(fixturePath, join(consumerDir, 'consumer.mjs'))
  copyFileSync(authoringFixturePath, join(consumerDir, 'consumer-authoring.mjs'))
  copyFileSync(authoringReviewFixturePath, join(consumerDir, 'consumer-authoring-review.mjs'))
  copyFileSync(rollbackFixturePath, join(consumerDir, 'consumer-rollback.mjs'))
  copyFileSync(typeFixturePath, join(consumerDir, 'consumer-type-fixture.ts'))
  mkdirSync(join(consumerDir, 'fixtures', 'catalog'), { recursive: true })
  copyFileSync(manifestFixturePath, join(consumerDir, 'fixtures', 'customer-orders.json'))
  copyFileSync(catalogFixturePath, join(consumerDir, 'fixtures', 'catalog', 'postgres-commerce.json'))
  copyFileSync(registryFixturePath, join(consumerDir, 'fixtures', 'commerce-registry.yaml'))

  const manifest = JSON.parse(readFileSync(join(consumerDir, 'package.json'), 'utf8'))
  if (manifest.name !== '@context-action/dpm') throw new Error('packed package name does not match @context-action/dpm')
  if (!manifest.exports?.['./data'] || !manifest.exports?.['./relationship'] || !manifest.exports?.['./authoring']) {
    throw new Error('packed package is missing the public data/relationship/authoring subpaths')
  }

  const output = execFileSync(process.execPath, ['consumer.mjs'], {
    cwd: consumerDir,
    encoding: 'utf8',
  }).trim()
  const result = JSON.parse(output)
  if (result.status !== 'ok') throw new Error('external consumer fixture did not complete')
  const authoringOutput = execFileSync(process.execPath, ['consumer-authoring.mjs'], {
    cwd: consumerDir,
    encoding: 'utf8',
  }).trim()
  const authoringResult = JSON.parse(authoringOutput)
  if (authoringResult.status !== 'ok') throw new Error('external authoring consumer fixture did not complete')
  const authoringReviewOutput = execFileSync(process.execPath, ['consumer-authoring-review.mjs'], {
    cwd: consumerDir,
    encoding: 'utf8',
  }).trim()
  const authoringReviewResult = JSON.parse(authoringReviewOutput)
  if (authoringReviewResult.status !== 'ok') throw new Error('external authoring review consumer fixture did not complete')
  execFileSync(tscPath, [
    '--noEmit',
    '--target',
    'ES2022',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--strict',
    '--skipLibCheck',
    'consumer-type-fixture.ts',
  ], {
    cwd: consumerDir,
    encoding: 'utf8',
  })
  const rollbackOutput = execFileSync(process.execPath, ['consumer-rollback.mjs'], {
    cwd: consumerDir,
    encoding: 'utf8',
  }).trim()
  const rollbackResult = JSON.parse(rollbackOutput)
  if (rollbackResult.status !== 'ok') throw new Error('external rollback fixture did not complete')
  console.log(JSON.stringify({
    status: 'ok',
    archive: archiveName,
    consumer: result,
    configuredAuthoringConsumer: authoringResult,
    authoringReviewConsumer: authoringReviewResult,
    declarationConsumer: 'ok',
    rollbackConsumer: rollbackResult,
  }, null, 2))
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
