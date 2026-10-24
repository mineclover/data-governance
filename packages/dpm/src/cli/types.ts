export type DpmCliCommand = 'validate' | 'compile' | 'dry-run' | 'registry-summary' | 'registry-list'
export type DpmCliFormat = 'json' | 'text'

export type DpmCliResult = {
  exitCode: number
  stdout: string
  stderr: string
}

export type DpmCliParsedArgs = {
  command: DpmCliCommand
  manifestPath: string
  catalogPath: string
  registryPath: string
  estimatedRowsPath?: string
  format: DpmCliFormat
}
