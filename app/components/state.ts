import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ExpendRecord } from '@/lib/source'
import dayjs, { Dayjs } from 'dayjs'

const exampleData: ExpendRecord[] = [
  {
    rid: '123124',
    kind: '餐饮',
    remark: '早餐',
    amount: -12.4,
    date: '2023-6-20',
    createAt: '2023-6-20 6:50',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '晚饭',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 11:59',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '午餐',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 12:00',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '宵夜',
    amount: -32.4,
    date: '2023-6-21',
    createAt: '2023-6-21 1:30',
  },
  {
    rid: '123124',
    kind: '日用',
    remark: '纸巾和农夫山泉',
    amount: -18.5,
    date: '2023-6-21',
    createAt: '2023-6-21 12:00',
  },
  {
    rid: '123124',
    kind: '住房',
    remark: '6月房租水电',
    amount: -2213.89,
    date: '2023-6-22',
    createAt: '2023-6-22 11:58',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '早餐',
    amount: -12.4,
    date: '2023-6-20',
    createAt: '2023-6-20 6:50',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '晚饭',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 11:59',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '午餐',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 12:00',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '宵夜',
    amount: -32.4,
    date: '2023-6-21',
    createAt: '2023-6-21 1:30',
  },
  {
    rid: '123124',
    kind: '日用',
    remark: '纸巾和农夫山泉',
    amount: -18.5,
    date: '2023-6-21',
    createAt: '2023-6-21 12:00',
  },
  {
    rid: '123124',
    kind: '住房',
    remark: '6月房租水电',
    amount: -2213.89,
    date: '2023-6-22',
    createAt: '2023-6-22 11:58',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '早餐',
    amount: -12.4,
    date: '2023-6-20',
    createAt: '2023-6-20 6:50',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '晚饭',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 11:59',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '午餐',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 12:00',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '宵夜',
    amount: -32.4,
    date: '2023-6-21',
    createAt: '2023-6-21 1:30',
  },
  {
    rid: '123124',
    kind: '日用',
    remark: '纸巾和农夫山泉',
    amount: -18.5,
    date: '2023-6-21',
    createAt: '2023-6-21 12:00',
  },
  {
    rid: '123124',
    kind: '住房',
    remark: '6月房租水电',
    amount: -2213.89,
    date: '2023-6-22',
    createAt: '2023-6-22 11:58',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '早餐',
    amount: -12.4,
    date: '2023-6-20',
    createAt: '2023-6-20 6:50',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '晚饭',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 11:59',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '午餐',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 12:00',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '宵夜',
    amount: -32.4,
    date: '2023-6-21',
    createAt: '2023-6-21 1:30',
  },
  {
    rid: '123124',
    kind: '日用',
    remark: '纸巾和农夫山泉',
    amount: -18.5,
    date: '2023-6-21',
    createAt: '2023-6-21 12:00',
  },
  {
    rid: '123124',
    kind: '住房',
    remark: '6月房租水电',
    amount: -2213.89,
    date: '2023-6-22',
    createAt: '2023-6-22 11:58',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '早餐',
    amount: -12.4,
    date: '2023-6-20',
    createAt: '2023-6-20 6:50',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '晚饭',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 11:59',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '午餐',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 12:00',
  },
  {
    rid: '123124',
    kind: '餐饮',
    remark: '宵夜',
    amount: -32.4,
    date: '2023-6-21',
    createAt: '2023-6-21 1:30',
  },
  {
    rid: '123124',
    kind: '日用',
    remark: '纸巾和农夫山泉',
    amount: -18.5,
    date: '2023-6-21',
    createAt: '2023-6-21 12:00',
  },
  {
    rid: '123124',
    kind: '住房',
    remark: '6月房租水电',
    amount: -2213.89,
    date: '2023-6-22',
    createAt: '2023-6-22 11:58',
  },
]

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

export const kindPresetAtom = atomWithStorage<KeywordUsageRecord[]>('kinds_preset', [])
export const remarkPresetAtom = atomWithStorage<KeywordUsageRecord[]>('remark_preset', [])
export const incrementKindTimesAtom = createIncrementKeywordTimesAtom(kindPresetAtom)
export const incrementRemarkTimesAtom = createIncrementKeywordTimesAtom(remarkPresetAtom)

export const appTokenAtom = atomWithStorage('app_token', 'xxx')
