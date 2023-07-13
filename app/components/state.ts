import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ExpendRecord } from '@/lib/source'
import dayjs, { Dayjs } from 'dayjs'

export const monthAtom = atom<Dayjs>(dayjs())
export const recordsAtom = atom<ExpendRecord[]>([])
export const loadingAtom = atom(false)

interface KeywordUsageRecord {
  keyword: string
  times: number
}

function createIncrementKeywordTimesAtom(targetAtom: ReturnType<typeof atomWithStorage<KeywordUsageRecord[]>>) {
  return atom(null, (get, set, keyword: string) => {
    const keywordPreset = [...get(targetAtom)]
    let targetKeyword = keywordPreset.find(item => {
      if (item.keyword === keyword) {
        item.times += 1
        return true
      }
      return false
    })
    if (!targetKeyword) {
      targetKeyword = {
        keyword,
        times: 1
      }
      keywordPreset.push(targetKeyword)
    }
    // 重新排序
    keywordPreset.sort((a, b) => {
      if (b.times > a.times) return 1
      if (b.times < a.times) return -1
      if (b.times === a.times && b === targetKeyword) return 1
      return 0
    })
    // 限制长度
    ;(keywordPreset.length >= 50) && (keywordPreset.length = 50)
    set(targetAtom, keywordPreset)
  })
}

export const displayCollectorAtom = atom(false)
export const editingRecordAtom = atom<ExpendRecord | null>(null)
export const kindPresetAtom = atomWithStorage<KeywordUsageRecord[]>('kinds_preset', [])
export const remarkPresetAtom = atomWithStorage<KeywordUsageRecord[]>('remark_preset', [])
export const incrementKindTimesAtom = createIncrementKeywordTimesAtom(kindPresetAtom)
export const incrementRemarkTimesAtom = createIncrementKeywordTimesAtom(remarkPresetAtom)

export const appTokenAtom = atomWithStorage('app_token', 'xxx')
