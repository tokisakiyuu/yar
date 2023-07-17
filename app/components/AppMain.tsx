import { useState } from 'react'
import dayjs from "dayjs"
import { useMount } from 'react-use'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MdArrowLeft, MdArrowRight, MdWarningAmber } from 'react-icons/md'
import Collector from './Collector'
import { createOperationAtom, displayCollectorAtom, editingRecordAtom, loadingAtom, monthAtom, recordsAtom, warningAtom } from './state'
import { sortRecordsByDate, toFixedTow } from '@/lib/utils'
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
          <div className='mx-auto flex items-center' onClick={() => setDisplayAnalysis(!displayAnalysis)}>
            <SyncStatus />
            <div>{month.format('YYYY年M月')}</div>
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
            <span className='ml-auto'>{toFixedTow(group.total)}</span>
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
        <p className='mt-2'>{toFixedTow(totalExpend)}</p>
        <h3 className='text-2xl mt-4'>收入</h3>
        <p className='mt-2'>{toFixedTow(totalIncome)}</p>
      </div>
    </div>
  )
}

function SyncStatus() {
  const loading = useAtomValue(loadingAtom)
  const warning = useAtomValue(warningAtom)
  return (
    <div className='text-white flex items-center'>
      {loading && <svg className='loop-rotation h-5 w-5' xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"><path d="M53.17206,99.99999c0,16.20261,8.22887,30.48326,20.73538,38.8907L63.2893,154.94629C45.58296,143.09284,33.92538,122.90781,33.92538,100v-.00001c.00001-36.17975,29.07853-65.56786,65.13942-66.06813l.02379-10.97322l28.08122,20.49398L99,63.82466l.02307-10.64262c-25.41134.52005-45.85101,21.28203-45.85101,46.81795ZM166.07462,100c0,36.21406-29.1337,65.62359-65.24201,66.06948l.01911,11.3006-28.1601-20.38546l28.09098-20.48059.01745,10.31722c25.4933-.42707,46.02788-21.2261,46.02788-46.82124c0-16.34423-8.37335-30.73275-21.0643-39.10981l10.61799-16.05537c17.89084,11.82287,29.693,32.11575,29.693,55.16518v-.00001Z" fill="currentColor" stroke-width="0"/></svg>}
      {warning && <MdWarningAmber className='h-5 w-5' />}
    </div>
  )
}