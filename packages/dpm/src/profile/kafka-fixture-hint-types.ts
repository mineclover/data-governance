export type DpmKafkaRelationshipHintFixture = {
  id: string
  label: string
  fromPath?: string
  fromPointer?: string
  toRef: string
  confidence: number
  evidenceRef?: string
}
