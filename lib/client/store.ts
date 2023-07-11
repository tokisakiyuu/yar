import dayjs from 'dayjs'
import { getDefaultStore } from 'jotai'
import storage from './storage'
import { ExpendRecord } from '../source'
import { appTokenAtom } from '@/app/components/state'

const store = getDefaultStore()

export async function fetchTable(month: string): Promise<ExpendRecord[]> {
  const appToken = store.get(appTokenAtom)
  if (!appToken) return []
  const res = await fetch(`/api/table/${month}`, {
    headers: {
      'Authorization': `Bearer ${appToken}`
    }
  })
  if (res.status === 200) {
    const records = await res.json()
    if (dayjs().format('YYYY-MM') === month) {
      await storage.setItem('cached_records', records)
    }
    return records
  }
  if (res.status === 401) {
    store.set(appTokenAtom, '')
  }
  return []
}

export async function updateTable(month: string, records: ExpendRecord[]) {
  if (dayjs().format('YYYY-MM') === month) {
    await storage.setItem('cached_records', records)
  }
  const appToken = store.get(appTokenAtom)
  if (!appToken) return
  const res = await fetch(`/api/table/${month}`, {
    method: 'POST',
    body: JSON.stringify(records),
    headers: {
      'Authorization': `Bearer ${appToken}`
    }
  })
  if (res.status === 401) {
    store.set(appTokenAtom, '')
  }
}