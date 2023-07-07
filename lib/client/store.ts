import dayjs from 'dayjs'
import { getDefaultStore } from 'jotai'
import storage from './storage'
import { ExpendRecord } from '../source'
import { recordsAtom } from '@/app/components/state'

const store = getDefaultStore()

export async function fetchTable(month: string): Promise<ExpendRecord[]> {
  const res = await fetch(`/api/table/${month}`)
  if (res.status === 200) {
    const records = await res.json()
    if (dayjs().format('YYYY-MM') === month) {
      await storage.setItem('cached_records', records)
    }
    return records
  }
  return []
}

export async function updateTable(month: string, records: ExpendRecord[]) {
  if (dayjs().format('YYYY-MM') === month) {
    await storage.setItem('cached_records', records)
  }
  await fetch(`/api/table/${month}`, {
    method: 'POST',
    body: JSON.stringify(records)
  })
}

(async () => {
  if (typeof window === 'undefined') return
  const records = await storage.getItem('cached_records')
  if (Array.isArray(records)) {
    store.set(recordsAtom, records)
  } else {
    store.set(recordsAtom, await fetchTable(dayjs().format('YYYY-MM')))
  }
})()