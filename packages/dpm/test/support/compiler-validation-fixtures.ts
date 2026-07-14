export type CompilerValidationBlockingCase = {
  label: string
  expectedDiagnosticCode: string
  mutateManifest: (manifest: Record<string, any>) => void
}

export const compilerValidationBlockingCases = [
  {
    label: 'manifest metadata dataset that differs from the approved registry snapshot',
    expectedDiagnosticCode: 'REL011',
    mutateManifest: manifest => {
      manifest.metadata.dataset_id = 'other_tenant'
    },
  },
  {
    label: 'unsafe direct identifier keep transform',
    expectedDiagnosticCode: 'SAF001',
    mutateManifest: manifest => {
      manifest.columns[0].transform = { type: 'keep' }
    },
  },
  {
    label: 'identical policies for the same table and column',
    expectedDiagnosticCode: 'SAF013',
    mutateManifest: manifest => {
      manifest.columns.push(structuredClone(manifest.columns[0]))
    },
  },
  {
    label: 'conflicting policies for the same table and column',
    expectedDiagnosticCode: 'SAF013',
    mutateManifest: manifest => {
      manifest.columns.push({
        ...structuredClone(manifest.columns[0]),
        role: 'business_metric',
        pii: false,
        transform: { type: 'keep' },
      })
    },
  },
  {
    label: 'approved registry name with changed relationship semantics',
    expectedDiagnosticCode: 'REL013',
    mutateManifest: manifest => {
      manifest.relationships[0].namespace = 'account'
    },
  },
  {
    label: 'column relationship absent from manifest relationship set',
    expectedDiagnosticCode: 'SAF012',
    mutateManifest: manifest => {
      manifest.columns[1].relationship = 'rel_missing_customer'
      manifest.columns[1].transform.relationship = 'rel_missing_customer'
    },
  },
] as const satisfies readonly CompilerValidationBlockingCase[]
