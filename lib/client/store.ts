import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import { getDefaultStore } from 'jotai'
import storage from './storage'
import { ExpendRecord, ChangeLog } from '../source'
import { currentMonthRecordsAtom } from '@/app/components/state'

// server_records 存放从服务端获取的当月消费记录
// change_logs    客户端用户对以上消费记录的操作的记录
// latest_records 最新记录（服务端消费记录 + 用户操作）

const currentDate = dayjs()
const jotaiStore = getDefaultStore()

/**
 * 同步客户端与服务器之间的记录
 */
async function sync() {
  const changeLogs: ChangeLog[] | null = await storage.getItem('change_logs')
  const currentMonth = currentDate.format('YYYY-MM')
  // 如果没有changes_logs，那就直接获取当月消费记录，更新到本地数据库
  if (!changeLogs || !changeLogs.length) {
    const records = await fetchTable(currentMonth)
    jotaiStore.set(currentMonthRecordsAtom, records)
    await storage.setItem(`records_${currentMonth}`, records)
    return
  }
  // 发送客户端change_logs，交给服务端进行计算（消费change_logs）
  await reportChangeLogs(changeLogs)
  // 清空客户端change_logs
  await storage.removeItem('change_logs')
  // 待服务端计算完毕，向服务端请求获取最新当月消费记录，更新到本地数据库
  const records = await fetchTable(currentMonth)
  jotaiStore.set(currentMonthRecordsAtom, records)
  await storage.setItem(`records_${currentMonth}`, records)
}

async function fetchTable(month: string): Promise<ExpendRecord[]> {
  const res = await fetch(`/api/table/${month}`)
  if (res.status === 200) {
    return await res.json()
  }
  return []
}

async function reportChangeLogs(changeLogs: ChangeLog[]) {
  await fetch('/api/report', {
    method: 'POST',
    body: JSON.stringify({ changeLogs })
  })
}