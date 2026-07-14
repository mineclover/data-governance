const UTF8_ENCODER = new TextEncoder()

export function frameWellFormedUtf8(value: string, label: string): string {
  assertWellFormedUnicode(value, label)
  return `${UTF8_ENCODER.encode(value).byteLength}:${value}`
}

export function assertWellFormedUnicode(value: string, label: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF) {
      const next = value.charCodeAt(index + 1)
      if (next >= 0xDC00 && next <= 0xDFFF) {
        index += 1
        continue
      }
      throw new Error(`${label} must contain only well-formed Unicode`)
    }
    if (codeUnit >= 0xDC00 && codeUnit <= 0xDFFF) {
      throw new Error(`${label} must contain only well-formed Unicode`)
    }
  }
}
