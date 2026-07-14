export type DpmKafkaKeyFixture = {
  dataType: string
  coverageRatio?: number
}

export type DpmKafkaHeaderFixture = {
  name: string
  dataType: string
  presenceRatio?: number
}

export type DpmKafkaSchemaFixture = {
  subject: string
  format: string
  versions: number[]
}
