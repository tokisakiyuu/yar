'use client'

import { useState } from 'react'
import dayjs from "dayjs"
import Collector from './components/Collector'

export default function Home() {
  const [displayCollector, setDisplaycollector] = useState(false)
  return (
    <main>
      {sortRecordsByDate(exampleData).map((group, i) => (
        <div key={i} className='px-3 mt-2.5'>
          <div className='flex items-center text-[#9f9f9f] text-sm py-1'>
            <span>{dayjs(group.date).format('YYYY年MM月DD日')}</span>
            <span className="ml-2">周{['日', '一', '二', '三', '四', '五', '六'][dayjs(group.date).get('d')]}</span>
            <span className='ml-auto'>{group.total}</span>
          </div>
          {group.records.map((record, ri) => (
            <div key={`${i}-${ri}`} className='flex items-center border-b border-[#F6F6F6] py-2.5'>
              <div className='bg-[#F3F3F3] text-sm px-1 py-0.5 text-slate-800'>{record.kind}</div>
              <div className="ml-2">{record.remark}</div>
              <div className='ml-auto'>{record.amount}</div>
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center justify-center pt-12 pb-32 text-[#c9c9c9]">
        <span>没有更多了</span>
      </div>
      <div
        className="flex items-center justify-center w-16 h-16 bg-[#6C97FC] rounded-full text-white text-3xl leading-none fixed bottom-7 right-7 cursor-pointer select-none"
        style={{ bottom: 'calc(1.75rem + var(--safe-area-inset-bottom))' }}
        onClick={() => setDisplaycollector(true)}
      >+</div>
      <Collector
        show={displayCollector}
        onClose={() => setDisplaycollector(false)}
        onComplete={data => {
          console.log(data)
          setDisplaycollector(false)
        }}
        onDelete={() => {
          console.log('request delete record')
          setDisplaycollector(false)
        }}
      />
    </main>
  )
}

const exampleData = [
  {
    kind: '餐饮',
    remark: '早餐',
    amount: -12.4,
    date: '2023-6-20',
    createAt: '2023-6-20 6:50',
  },
  {
    kind: '餐饮',
    remark: '晚饭',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 11:59',
  },
  {
    kind: '餐饮',
    remark: '午餐',
    amount: -22.7,
    date: '2023-6-22',
    createAt: '2023-6-22 12:00',
  },
  {
    kind: '餐饮',
    remark: '宵夜',
    amount: -32.4,
    date: '2023-6-21',
    createAt: '2023-6-21 1:30',
  },
  {
    kind: '日用',
    remark: '纸巾和农夫山泉',
    amount: -18.5,
    date: '2023-6-21',
    createAt: '2023-6-21 12:00',
  },
  {
    kind: '住房',
    remark: '6月房租水电',
    amount: -2213.89,
    date: '2023-6-22',
    createAt: '2023-6-22 11:58',
  },
]

interface ExpendRecord {
  kind: string
  remark: string
  amount: number
  date: string,
  createAt: string,
}

interface DailyRecords {
  date: string
  total: number
  records: ExpendRecord[]
}

const createAtFormat = 'YYYY-M-D H:mm'

function sortRecordsByDate(data: ExpendRecord[]): DailyRecords[] {
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