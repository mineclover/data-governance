export type DpmKafkaMessageFieldFixture = {
  name: string
  dataType: string
  presenceRatio?: number
  nullRatio?: number
  fields?: DpmKafkaMessageFieldFixture[]
}
