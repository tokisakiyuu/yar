import { useEffect, useState } from 'react'
import { useMount, useUpdateEffect } from 'react-use'
import dayjs from "dayjs"
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { MdArrowLeft, MdArrowRight } from 'react-icons/md'
import Collector from './Collector'
import { loadingAtom, monthAtom, recordsAtom } from './state'
import { sortRecordsByDate } from '@/lib/utils'
import { fetchTable, updateTable } from '@/lib/client/store'
import { ExpendRecord } from '@/lib/source'
import storage from '@/lib/client/storage'

export default function AppMain() {
  const [displayCollector, setDisplaycollector] = useState(false)
  const [month, setMonth] = useAtom(monthAtom)
  const [records, setRecords] = useAtom(recordsAtom)
  const [loading, setLoading] = useAtom(loadingAtom)
  const [editingRecord, setEditingRecord] = useState<ExpendRecord | null>(null)
  useAutoMonthRecords()
  const toEditRecord = (record: ExpendRecord) => {
    setEditingRecord(record)
    setDisplaycollector(true)
  }
  return (
    <main>
      <div className='h-14 bg-[#6C97FC] sticky top-0 flex items-center text-white px-3'>
        <div className='mr-auto text-3xl' onClick={() => setMonth(month.subtract(1, 'month'))}>
          <MdArrowLeft />
        </div>
        <div className='mx-auto'>
          {month.format('YYYY年M月')}
        </div>
        <div className='ml-auto text-3xl' onClick={() => setMonth(month.add(1, 'month'))}>
          <MdArrowRight />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center pt-12 pb-32 text-[#c9c9c9]">
          <span>加载中...</span>
        </div>
      ) : (
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
      )}
      <div
        className="flex items-center justify-center w-16 h-16 bg-[#6C97FC] rounded-full text-white text-3xl leading-none fixed bottom-7 right-7 cursor-pointer select-none"
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
            const newRecords = [data, ...records]
            setRecords(newRecords)
            updateTable(month.format('YYYY-MM'), newRecords)
          } else {
            // 更新
            const newRecords = [...records]
            const index = newRecords.findIndex(r => r.rid === data.rid)
            if (index >=0) {
              newRecords.splice(index, 1, data)
              setRecords(newRecords)
              updateTable(month.format('YYYY-MM'), newRecords)
            }
            setEditingRecord(null)
          }
        }}
        onDelete={() => {
          setDisplaycollector(false)
          // 删除
          if (!editingRecord) return
          const newRecords = [...records]
          const index = newRecords.findIndex(r => r.rid === editingRecord.rid)
          if (index >=0) {
            newRecords.splice(index, 1)
            setRecords(newRecords)
            updateTable(month.format('YYYY-MM'), newRecords)
          }
          setEditingRecord(null)
        }}
      />
    </main>
  )
}

function useAutoMonthRecords() {
  const [month, setMonth] = useAtom(monthAtom)
  const [records, setRecords] = useAtom(recordsAtom)
  const [loading, setLoading] = useAtom(loadingAtom)
  useUpdateEffect(() => {
    setLoading(true)
    fetchTable(month.format('YYYY-MM'))
      .then(records => {
        setRecords(records)
        setLoading(false)
      })
  }, [month])
  useMount(async () => {
    const records = await storage.getItem('cached_records')
    if (Array.isArray(records)) {
      setRecords(records)
    }
    setRecords(await fetchTable(dayjs().format('YYYY-MM')))
  })
}
