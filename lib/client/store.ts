import dayjs from 'dayjs'
import { getDefaultStore } from 'jotai'
import storage from './storage'
import { ExpendRecord } from '../source'
import { recordsAtom } from '@/app/components/state'
import { getQueryParameter } from '../utils'

const store = getDefaultStore()
const apiHeaders = new Headers({ 'Authorization': `Bearer ${getQueryParameter('token')}` })

export async function fetchTable(month: string): Promise<ExpendRecord[]> {
  const res = await fetch(`/api/table/${month}`, { headers: apiHeaders })
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
    body: JSON.stringify(records),
    headers: apiHeaders
  })
}

(async () => {
  if (typeof window === 'undefined') return
  const records = await storage.getItem('cached_records')
  if (Array.isArray(records)) {
    store.set(recordsAtom, records)
  }
  store.set(recordsAtom, await fetchTable(dayjs().format('YYYY-MM')))
})()