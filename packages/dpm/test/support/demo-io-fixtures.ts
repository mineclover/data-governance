export function parseDemoJsonStdout(stdout: string): Record<string, any> {
  return JSON.parse(stdout) as Record<string, any>
}
