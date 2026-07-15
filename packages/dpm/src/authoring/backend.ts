export const DPM_AUTHORING_BACKEND_ENV = 'DPM_AUTHORING_BACKEND' as const

export const DPM_AUTHORING_BACKEND_VALUES = ['memory', 'postgres'] as const

export type DpmAuthoringBackend = typeof DPM_AUTHORING_BACKEND_VALUES[number]

export type DpmAuthoringBackendResolutionSource = 'default' | 'environment' | 'explicit'

export type DpmAuthoringBackendResolution = {
  backend: DpmAuthoringBackend
  source: DpmAuthoringBackendResolutionSource
}

export type DpmAuthoringBackendResolutionInput = {
  /** An explicit deployment value takes precedence over the environment. */
  backend?: unknown
  /** Injected environment values keep resolution deterministic in tests and hosts. */
  env?: Readonly<Record<string, string | undefined>>
}

export type DpmAuthoringBackendAdapters<T> = {
  readonly [backend in DpmAuthoringBackend]: T
}

export const DPM_DEFAULT_AUTHORING_BACKEND = 'memory' as const

export function isDpmAuthoringBackend(value: unknown): value is DpmAuthoringBackend {
  return typeof value === 'string'
    && (DPM_AUTHORING_BACKEND_VALUES as readonly string[]).includes(value)
}

export function resolveDpmAuthoringBackend(
  input: DpmAuthoringBackendResolutionInput = {},
): DpmAuthoringBackendResolution {
  const hasExplicitBackend = input.backend !== undefined
  const configured = hasExplicitBackend
    ? input.backend
    : (input.env ?? process.env)[DPM_AUTHORING_BACKEND_ENV]

  if (configured === undefined) {
    return {
      backend: DPM_DEFAULT_AUTHORING_BACKEND,
      source: 'default',
    }
  }

  if (typeof configured !== 'string') {
    throw new Error(
      `DPM authoring backend must be one of ${DPM_AUTHORING_BACKEND_VALUES.join(', ')}.`,
    )
  }

  const normalized = configured.trim()
  if (!isDpmAuthoringBackend(normalized)) {
    throw new Error(
      `DPM authoring backend must be one of ${DPM_AUTHORING_BACKEND_VALUES.join(', ')}; received ${JSON.stringify(configured)}.`,
    )
  }

  return {
    backend: normalized,
    source: hasExplicitBackend ? 'explicit' : 'environment',
  }
}

/** Selects an already-created adapter; it never creates a client or changes external state. */
export function selectDpmAuthoringBackendAdapter<T>(
  input: DpmAuthoringBackendResolutionInput,
  adapters: DpmAuthoringBackendAdapters<T>,
): T {
  return adapters[resolveDpmAuthoringBackend(input).backend]
}
