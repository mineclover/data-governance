import type { DpmRelationshipStep } from '../compiler/plan.js'
import type { DpmRelationshipMetadata } from './relationship-types.js'

export function toDpmRelationshipMetadata(step: DpmRelationshipStep): DpmRelationshipMetadata {
  return {
    name: step.name,
    namespace: step.namespace,
    cardinality: step.cardinality,
    parentTable: step.parent.table,
    parentColumns: [...step.parent.columns],
    childTable: step.child.table,
    childColumns: [...step.child.columns],
    joinPredicate: renderJoinPredicate(step),
    transformStrategy: step.transformStrategy,
    orphanPolicy: step.orphanPolicy,
    readonly: true,
  }
}

function renderJoinPredicate(step: DpmRelationshipStep): string {
  return step.child.columns
    .map((childColumn, index) => {
      const parentColumn = step.parent.columns[index] ?? childColumn
      return `${step.child.table}.${childColumn} = ${step.parent.table}.${parentColumn}`
    })
    .join(' AND ')
}
