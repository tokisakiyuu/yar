import { getDefaultStore } from 'jotai'
import storage from './storage'
import { appTokenAtom, cachedRecordsAtom, monthAtom, operationRecordsAtom } from '@/app/components/state'

const store = getDefaultStore()

export async function syncCurrentMonth() {
  const month = store.get(monthAtom).format('YYYY-MM')
  await setupRecords(month)
  sync(month).then(() => {
    const latestMonth = store.get(monthAtom).format('YYYY-MM')
    if (latestMonth === month) return setupRecords(month)
  })
}

async function setupRecords(month: string) {
  const records = (await storage.getItem(`${month}_records`)) || []
  const ops = (await storage.getItem(`${month}_ops`)) || []
  store.set(cachedRecordsAtom, records)
  store.set(operationRecordsAtom, ops)
}

export async function sync(month: string) {
  await postOps(month)
  await downloadRecords(month)
}

async function postOps(month: string) {
  const ops = (await storage.getItem(`${month}_ops`))
  if (!Array.isArray(ops) || !ops.length) return
  const res = await fetch(`/api/table/${month}`, {
    method: 'POST',
    body: JSON.stringify(ops)
  })
  if (res.status === 200) {
    await storage.removeItem(`${month}_ops`)
  }
}

async function downloadRecords(month: string) {
  const res = await fetch(`/api/table/${month}`)
  if (res.status === 200) {
    const records = await res.json()
    await storage.setItem(`${month}_records`, records)
  }
}

async function fetch(url: string, init?: RequestInit) {
  const res = await window.fetch(url, {
    ...(init || {}),
    headers: {
      'Authorization': `Bearer ${store.get(appTokenAtom)}`
    }
  })
  if (res.status === 401) {
    store.set(appTokenAtom, '')
  }
  return res
}