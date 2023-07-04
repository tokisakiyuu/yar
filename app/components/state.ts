import { atom, getDefaultStore } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { ChangeLog, ExpendRecord } from '@/lib/source'
import dayjs from 'dayjs'

export const changeLogsAtom = atomWithStorage<ChangeLog[]>('change_logs', [])
export const enduringRecordsAtom = atomWithStorage<ExpendRecord[]>('records', [])
export const loadedRecordsAtom = atom<ExpendRecord[]>([])
export const recordsAtom = atom(get => ([...get(enduringRecordsAtom), ...get(loadedRecordsAtom)]))

export const pushChangeLogAtom = atom(null, (get, set, log: ChangeLog) => {
  set(changeLogsAtom, [
    ...get(changeLogsAtom),
    log
  ])
  if (log.action === 'add') {
    const headRecords = get(enduringRecordsAtom)
    headRecords.unshift(log.record)
    set(enduringRecordsAtom, headRecords)
  }
  const inHeadRecordsIndex = get(enduringRecordsAtom).findIndex(record => record.rid === log.record.rid)
  const inLoaddedRecordsIndex = get(loadedRecordsAtom).findIndex(record => record.rid === log.record.rid)
  if (log.action === 'update') {

  }
})