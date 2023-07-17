import { useState } from 'react'
import dayjs from "dayjs"
import { useMount } from 'react-use'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MdArrowLeft, MdArrowRight } from 'react-icons/md'
import Collector from './Collector'
import { createOperationAtom, displayCollectorAtom, editingRecordAtom, monthAtom, recordsAtom } from './state'
import { sortRecordsByDate } from '@/lib/utils'
import { ExpendRecord } from '@/lib/types'
import { syncCurrentMonth } from '@/lib/client/store'

export default function AppMain() {
  const [displayCollector, setDisplaycollector] = useAtom(displayCollectorAtom)
  const [editingRecord, setEditingRecord] = useAtom(editingRecordAtom)
  const createOperation = useSetAtom(createOperationAtom)
  useMount(() => {
    syncCurrentMonth()
  })
  return (
    <main className='bg-white'>
      <Header />
      <List />
      <div
        className="flex z-10 items-center justify-center w-16 h-16 bg-[#6C97FC] rounded-full text-white text-3xl leading-none fixed bottom-7 right-7 cursor-pointer select-none"
        style={{ bottom: 'calc(1.75rem + var(--safe-area-inset-bottom))' }}
        onClick={() => setDisplaycollector(true)}
      >+</div>
      <Collector
        show={displayCollector}
        edit={editingRecord}
        onClose={() => {
          setDisplaycollector(false)
          setEditingRecord(null)
        }}
        onComplete={data => {
          setDisplaycollector(false)
          if (!editingRecord) {
            // 添加
            createOperation({
              type: 'add',
              record: data
            })
          } else {
            // 更新
            createOperation({
              type: 'modify',
              rid: data.rid,
              record: data
            })
            setEditingRecord(null)
          }
        }}
        onDelete={() => {
          setDisplaycollector(false)
          // 删除
          if (editingRecord) {
            createOperation({
              type: 'delete',
              rid: editingRecord.rid
            })
            setEditingRecord(null)
          }
        }}
      />
    </main>
  )
}

function Header() {
  const [month, setMonth] = useAtom(monthAtom)
  const [displayAnalysis, setDisplayAnalysis] = useState(false)
  return (
    <>
      <Analysis show={displayAnalysis} />
      <div className='fixed z-50 top-0 w-full bg-[#6C97FC]'>
        <div className='h-[var(--safe-area-inset-top)] w-full' />
        <div className='h-14 flex items-center text-white px-3'>
          <div className='mr-auto text-3xl' onClick={() => setMonth(month.subtract(1, 'month'))}>
            <MdArrowLeft />
          </div>
          <div className='mx-auto' onClick={() => setDisplayAnalysis(!displayAnalysis)}>
            {month.format('YYYY年M月')}
          </div>
          <div className='ml-auto text-3xl' onClick={() => setMonth(month.add(1, 'month'))}>
            <MdArrowRight />
          </div>
        </div>
      </div>
      <div style={{ height: 'calc(var(--safe-area-inset-top) + 3.5rem)' }} />
    </>
  )
}

function List() {
  const [records, setRecords] = useAtom(recordsAtom)
  const [displayCollector, setDisplaycollector] = useAtom(displayCollectorAtom)
  const [editingRecord, setEditingRecord] = useAtom(editingRecordAtom)
  const toEditRecord = (record: ExpendRecord) => {
    setEditingRecord(record)
    setDisplaycollector(true)
  }
  return (
    <>
      {sortRecordsByDate(records).map((group, i) => (
        <div key={i} className='mt-2.5'>
          <div className='flex items-center text-[#9f9f9f] text-sm py-1 px-3'>
            <span>{dayjs(group.date).format('YYYY年MM月DD日')}</span>
            <span className="ml-2">周{['日', '一', '二', '三', '四', '五', '六'][dayjs(group.date).get('d')]}</span>
            <span className='ml-auto'>{group.total}</span>
          </div>
          {group.records.map((record, ri) => (
            <div key={`${i}-${ri}`} className='flex items-center border-b border-[#F6F6F6] py-2.5 px-3 active:bg-gray-50' onClick={() => toEditRecord(record)}>
              <div className='bg-[#F3F3F3] text-sm px-1 py-0.5 text-slate-800'>{record.kind || '未分类'}</div>
              <div className="ml-2">{record.remark || '无备注'}</div>
              <div className='ml-auto'>{record.amount}</div>
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center justify-center pt-12 pb-32 text-[#c9c9c9]">
        <span>{records.length ? '没有更多了' : '无记录'}</span>
      </div>
    </>
  )
}

function Analysis({
  show
}: {
  show: boolean
}) {
  const records = useAtomValue(recordsAtom)
  const totalExpend = records.reduce((total, item) => Number(item.amount) < 0 ? total + Math.abs(Number(item.amount)) : total, 0)
  const totalIncome = records.reduce((total, item) => Number(item.amount) > 0 ? total + Number(item.amount) : total, 0)
  return (
    <div
      className='fixed z-40 top-0 bottom-0 w-full bg-[#6C97FC] transition-[transform]'
      style={{ transform: show ? 'translateY(0)' : 'translateY(calc(-100%)' }}
    >
      <div style={{ height: 'calc(var(--safe-area-inset-top) + 3.5rem)' }} />
      <div className='text-white text-center pt-5'>
        <h3 className='text-2xl'>支出</h3>
        <p className='mt-2'>{totalExpend}</p>
        <h3 className='text-2xl mt-4'>收入</h3>
        <p className='mt-2'>{totalIncome}</p>
      </div>
    </div>
  )
}