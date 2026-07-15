import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

type DpmPackageManifest = {
  exports: Record<string, {
    import: string
    types: string
  }>
  scripts: Record<string, string>
}

const dpmPublicSubpathExportCases = [
  ['package', './dist/public/package.js', './dist/public/package.d.ts'],
  ['catalog', './dist/public/catalog.js', './dist/public/catalog.d.ts'],
  ['data', './dist/public/data.js', './dist/public/data.d.ts'],
  ['profile', './dist/public/profile.js', './dist/public/profile.d.ts'],
  ['relationship', './dist/public/relationship.js', './dist/public/relationship.d.ts'],
  ['gateway', './dist/public/gateway.js', './dist/public/gateway.d.ts'],
  ['storage', './dist/public/storage.js', './dist/public/storage.d.ts'],
  ['publishing', './dist/public/publishing.js', './dist/public/publishing.d.ts'],
  ['authoring', './dist/public/authoring.js', './dist/public/authoring.d.ts'],
] as const

describe('DPM package subpath exports', () => {
  it('publishes every public category barrel as a stable package subpath', () => {
    const manifest = readDpmPackageManifest()

    expect(manifest.exports['.']).toEqual({
      import: './dist/index.js',
      types: './dist/index.d.ts',
    })
    for (const [subpath, importPath, typesPath] of dpmPublicSubpathExportCases) {
      expect(manifest.exports[`./${subpath}`]).toEqual({
        import: importPath,
        types: typesPath,
      })
    }
  })

  it('builds each exported category barrel as a tsup entrypoint', () => {
    const manifest = readDpmPackageManifest()

    for (const [subpath] of dpmPublicSubpathExportCases) {
      expect(manifest.scripts.build).toContain(`src/public/${subpath}.ts`)
    }
  })
})

function readDpmPackageManifest(): DpmPackageManifest {
  return JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf-8'),
  ) as DpmPackageManifest
}
