import dayjs from 'dayjs'
import { ExpendRecord } from './source'

interface DailyRecords {
  date: string
  total: number
  records: ExpendRecord[]
}

const createAtFormat = 'YYYY-M-D H:mm'

export function sortRecordsByDate(data: ExpendRecord[]): DailyRecords[] {
  const grouped = new Map<string, ExpendRecord[]>()
  for (const record of data) {
    grouped.has(record.date)
      ? grouped.get(record.date)?.push(record)
      : grouped.set(record.date, [record])
  }
  const result: DailyRecords[] = []
  grouped.forEach((records, date) => {
    result.push({
      date,
      total: records.reduce((total, record) => total + record.amount, 0),
      records: records.sort((a, b) => dayjs(a.createAt, createAtFormat).isAfter(dayjs(b.createAt, createAtFormat)) ? -1 : 1)
    })
  })
  result.sort((a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? -1 : 1)
  return result
}