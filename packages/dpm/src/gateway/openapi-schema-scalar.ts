export function stringSchema() {
  return { type: 'string', minLength: 1 }
}

export function numberSchema() {
  return { type: 'number' }
}

export function ratioSchema() {
  return { type: 'number', minimum: 0, maximum: 1 }
}

export function integerSchema() {
  return { type: 'integer', minimum: 0 }
}
