import {
  createDpmProfileAnalysisReport,
} from '../../src/index.js'
import {
  createKafkaProfileArtifact,
} from './profile-analysis-fixtures.js'

export const profileArtifact = createKafkaProfileArtifact()
export const profileAnalysisReport = createDpmProfileAnalysisReport({ profileArtifact })

const derivedRelationshipHint = profileAnalysisReport.relationshipHints[0]
if (!derivedRelationshipHint) throw new Error('expected Kafka profile relationship hint')
export const relationshipHint = derivedRelationshipHint

const sourceNode = profileArtifact.nodes.find(node => node.id === relationshipHint.fromNodeId)
if (!sourceNode) throw new Error('expected relationship hint source node')
export const profileCoordinate = sourceNode.coordinate
