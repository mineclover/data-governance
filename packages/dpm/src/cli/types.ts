export type DpmCliCommand = 'validate' | 'compile' | 'dry-run'
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
