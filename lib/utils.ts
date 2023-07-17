import dayjs from 'dayjs'
import { ExpendRecord } from './types'

interface DailyRecords {
  date: string
  total: number
  records: ExpendRecord[]
}

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
      total: records.reduce((total, record) => total + Number(record.amount), 0),
      records
    })
  })
  result.sort((a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? -1 : 1)
  return result
}

export function toFixedTow(num: number) {
  return Math.floor(num * 100) / 100
}