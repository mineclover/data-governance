export function appendKafkaProfilePathSegment(parentPath: string, segment: string): string {
  return `${parentPath}.${escapeKafkaProfilePathSegment(segment)}`
}

export function appendKafkaProfilePointerSegment(parentPointer: string, segment: string): string {
  return `${parentPointer}/${escapeKafkaProfilePointerSegment(segment)}`
}

export function escapeKafkaProfilePathSegment(segment: string): string {
  return [...segment].map(escapeKafkaProfilePathChar).join('')
}

export function escapeKafkaProfilePointerSegment(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function escapeKafkaProfilePathChar(char: string): string {
  if (/^[A-Za-z0-9_-]$/.test(char)) return char

  const encoded = encodeURIComponent(char)
  if (encoded !== char) return encoded.toUpperCase()

  return `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
}
