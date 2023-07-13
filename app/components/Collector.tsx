import { Fragment, useEffect, useRef, useState } from 'react'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { RESET, atomWithReset } from 'jotai/utils'
import cx from 'clsx'
import dayjs, { Dayjs } from 'dayjs'
import { useScrolling } from 'react-use'
import { v4 as uuidv4 } from 'uuid'
import { ExpendRecord } from '@/lib/source'
import { incrementKindTimesAtom, incrementRemarkTimesAtom, kindPresetAtom, monthAtom, remarkPresetAtom } from './state'

interface Props {
  show: boolean
  edit: ExpendRecord | null
  onClose: () => void
  onComplete: (data: ExpendRecord) => void
  onDelete: () => void
}

export default function Collector({ show, edit, onClose, onComplete, onDelete }: Props) {
  const [amount, setAmount] = useAtom(amountAtom)
  const [isExpend, setExpend] = useAtom(isExpendAtom)
  const [step, setStep] = useAtom(stepAtom)
  const [kind, setKind] = useAtom(kindAtom)
  const [remark, setRemark] = useAtom(remarkAtom)
  const [date, setDate] = useAtom(dateAtom)
  const incrementKindTimes = useSetAtom(incrementKindTimesAtom)
  const incrementRemarkTimes = useSetAtom(incrementRemarkTimesAtom)
  // 重置和初始化此控件
  useEffect(() => {
    if (!show) {
      setAmount(RESET)
      setExpend(RESET)
      setStep(RESET)
      setKind(RESET)
      setRemark(RESET)
      setDate(RESET)
    }
    if (show && edit) {
      setAmount(String(Math.abs(edit.amount)))
      setExpend(edit.amount <= 0)
      setKind(edit.kind)
      setRemark(edit.remark)
      setDate(dayjs(edit.date).toDate())
    }
  }, [show])
  const handleComplete = () => {
    kind && incrementKindTimes(kind)
    remark.split(remarkSplitRegExp).filter(t => !!t).forEach(keyword => incrementRemarkTimes(keyword))
    onComplete({
      rid: edit ? edit.rid : uuidv4(),
      amount: Number(amount) * (isExpend ? -1 : 1),
      kind,
      createAt: edit ? edit.createAt : dayjs().format('YYYY-MM-DD HH:mm:ss'),
      date: dayjs(date).format('YYYY-MM-DD'),
      remark
    })
  }
  return (
    <>
      <div onClick={onClose} className={`fixed z-30 top-0 left-0 w-full h-full ${cx(!show && 'hidden')}`} />
      <div className={`fixed bottom-0 w-full bg-white rounded-t-2xl shadow-[0_20px_20px_20px_rgba(0,0,0,.2)] transition-transform ${cx({ 'translate-y-full': !show  })}`}>
        <div className="p-3 py-5 border-b-[#EDEDED] border-b">
          <div className="flex">
            <input className="flex-1 mr-6 outline-none text-sm" type="text" placeholder="未分类" maxLength={4} value={kind} onChange={(e) => setKind(e.target.value)} />
            <span className="ml-auto text-2xl">{isExpend ? '-' : '+'}{amount}</span>
          </div>
          <div className="flex justify-end mt-2.5">
            <input className="flex-1 outline-none text-sm text-right" type="text" placeholder="未备注" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </div>
        </div>
        <div className="flex select-none">
          <div className="flex-1 overflow-hidden h-[calc((100vw-3px)/4/1.5*4+3px)]">
            {step === 0 && <NumberKeyboard />}
            {step === 1 && <KindSelector />}
            {step === 2 && <RemarkSelector />}
          </div>
          <div className="items-stretch w-[1px] bg-[#EDEDED]" />
          <div className="flex flex-col ml-auto font-bold">
            <DateSelector value={dayjs(date).get('date')} onChange={dateValue => setDate(dayjs().set('date', dateValue).toDate())} />
            <div className="h-[1px] w-full bg-[#EDEDED]" />
            {step ===0
              ? <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden active:bg-[#f3f3f3]" onClick={() => setExpend(!isExpend)}>{isExpend ? '支出' : '收入'}</div>
              : <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden active:bg-[#f3f3f3]" onClick={() => setStep(step - 1)}>上一步</div>
            }
            <div className="h-[1px] w-full bg-[#EDEDED]" />
            {step !== 2
              ? <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden active:bg-[#f3f3f3]" onClick={handleComplete}>完成</div>
              : <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden active:bg-[#f3f3f3]" onClick={() => onDelete()}>删记录</div>
            }
            <div className="h-[1px] w-full bg-[#EDEDED]" />
            {step !== 2
              ? (
                <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden bg-[#6C97FC] text-white" onClick={() => setStep(step + 1)}>
                  {step === 0 && '去分类'}
                  {step === 1 && '去备注'}
                </div>
              ) : (
                <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden bg-[#6C97FC] text-white" onClick={handleComplete}>完成</div>
              )
            }
          </div>
        </div>
        <div className='h-[var(--safe-area-inset-bottom)] w-full bg-[#FFF]' />
      </div>
    </>
  )
}

const amountAtom = atomWithReset('0')
const isExpendAtom = atomWithReset(true)
const stepAtom = atomWithReset(0)
const kindAtom = atomWithReset('')
const remarkAtom = atomWithReset('')
const dateAtom = atomWithReset(new Date())

function NumberKeyboard() {
  const [amount, setAmount] = useAtom(amountAtom)
  const handleKeypress = (key: string) => {
    if (key === 'backward') {
      if (amount.length === 1) return setAmount('0')
      if (amount !== '0') return setAmount(amount.slice(0, -1))
    }
    if (key === '0' && amount === '0') return
    if (amount === '0' && key === '.') return setAmount(`0.`)
    if (amount === '0') return setAmount(key)
    setAmount(amount + key)
  }
  return (
    <div className="w-full h-full flex flex-col text-xl">
      {[
        [7, 8, 9],
        [4, 5, 6],
        [1, 2, 3],
        ['.', 0, 'backward']
      ].map((row, ri) => (
        <Fragment key={ri}>
          <div className="flex">
            {row.map((key, ci) => (
              <Fragment key={`${ri}-${ci}`}>
                <div className="aspect-[3/2] flex justify-center items-center w-[calc((100vw-3px)/4)] active:bg-[#f3f3f3]" onClick={() => handleKeypress(String(key))}>
                  {key === 'backward' ? <BackwardKey /> : key}
                </div>
                {row[ci + 1] !== undefined && <div className="w-[1px] items-stretch bg-[#EDEDED]" />}
              </Fragment>  
            ))}
          </div>
          <div className="w-full h-[1px] bg-[#EDEDED]" />
        </Fragment>
      ))}
    </div>
  )
}

const BackwardKey = () => (
  <div className="w-[1.5rem] h-[1.5rem]">
    <svg viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2397"><path d="M897.066667 896H342.4c-12.8 0-25.6-4.266667-34.133333-12.8l-298.666667-341.333333c-12.8-17.066667-12.8-38.4 0-55.466667l298.666667-341.333333c8.533333-12.8 21.333333-17.066667 34.133333-17.066667h554.666667c72.533333 0 128 55.466667 128 128v512c0 72.533333-55.466667 128-128 128zM363.733333 810.666667H897.066667c25.6 0 42.666667-17.066667 42.666666-42.666667V256c0-25.6-17.066667-42.666667-42.666666-42.666667H363.733333l-260.266666 298.666667 260.266666 298.666667z" p-id="2398"></path><path d="M513.066667 682.666667c-12.8 0-21.333333-4.266667-29.866667-12.8-17.066667-17.066667-17.066667-42.666667 0-59.733334l256-256c17.066667-17.066667 42.666667-17.066667 59.733333 0s17.066667 42.666667 0 59.733334l-256 256c-8.533333 8.533333-17.066667 12.8-29.866666 12.8z" p-id="2399"></path><path d="M769.066667 682.666667c-12.8 0-21.333333-4.266667-29.866667-12.8l-256-256c-17.066667-17.066667-17.066667-42.666667 0-59.733334s42.666667-17.066667 59.733333 0l256 256c17.066667 17.066667 17.066667 42.666667 0 59.733334-8.533333 8.533333-17.066667 12.8-29.866666 12.8z" p-id="2400"></path></svg>
  </div>
)

const tempKinds = ['餐饮', '交通', '日常', '健康', '医疗', '体育', '数码', '娱乐', '办公', '理财', '泡图书馆']

function KindSelector() {
  const setKind = useSetAtom(kindAtom)
  const kinds = useAtomValue(kindPresetAtom)
  return (
    <div className="w-full h-full overflow-y-scroll no-scrollbar">
      {!kinds.length && (
        <div className='h-full flex justify-center items-center flex-col text-[#EDEDED]'>
          <span>当前无分类预设</span>
          <span>请手动输入</span>
        </div>
      )}
      {groupByNumber(kinds.map(item => item.keyword), 3).map((row, ri) => (
        <Fragment key={ri}>
          <div className="flex">
            {row.map((kind, ci) => (
              <Fragment key={`${ri}-${ci}`}>
                <div className="aspect-[2/1] flex justify-center items-center w-[calc((100vw-3px)/4)] active:bg-[#f3f3f3]" onClick={() => setKind(kind)}>{kind}</div>
                {(ci + 1) % 3 !== 0 && <div className="w-[1px] items-stretch bg-[#EDEDED]" />}
              </Fragment>
            ))}
          </div>
          <div className='flex'>
            {Array(row.length).fill(0).map((_, i) => (
              <div key={i} className="bg-[#EDEDED] h-[1px] w-[calc((100vw-3px)/4)]" />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

const tempRemarks = ['小龙坎火锅', '小黄鸭', '晚饭', '农夫山泉', '午饭', '烤肉', '烧烤', '早餐', '纸巾和汽水']
const remarkSplitRegExp = /、|，|\/|\s+/

function RemarkSelector() {
  const [remark, setRemark] = useAtom(remarkAtom)
  const remarks = useAtomValue(remarkPresetAtom)
  const handleRemark = (addRemark: string) => {
    const remarkList = remark.split(remarkSplitRegExp).filter(r => r)
    if (remarkList.includes(addRemark)) {
      setRemark(remarkList.filter(r => r !== addRemark).join('、'))
    } else {
      remarkList.push(addRemark)
      setRemark(remarkList.join('、'))
    }
  }
  return (
    <>
      {!remarks.length && (
        <div className='h-full w-full flex justify-center items-center flex-col text-[#EDEDED]'>
          <span>当前无备注预设</span>
          <span>请手动输入</span>
        </div>
      )}
      <div className="flex p-3 gap-x-5 gap-y-3 flex-wrap">
        {remarks.map((remark, i) => (
          <span key={i} className="underline underline-offset-2 decoration-[#6C97FC]" onClick={() => handleRemark(remark.keyword)}>{remark.keyword}</span>
        ))}
      </div>
    </>
  )
}

function groupByNumber(arr: string[], n: number) {
  if (n <= 0) return []
  const result: string[][] = []
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n))
  }
  return result
}

function getMonthLastDay(date: Dayjs) {
  return dayjs(date).add(1, 'month').set('date', 1).subtract(1, 'day').get('date')
}

function DateSelector({
  onChange,
  value
}: {
  onChange: (value: number) => void
  value: number
}) {
  const currentSelectedMonth = useAtomValue(monthAtom)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useScrolling(containerRef)
  const [todayDate] = useState(() => (new Date()).getDate())
  const prevValue = useRef<number | null>(null)
  // 滚动过程中检测滚动到了几号
  useEffect(() => {
    if (!isScrolling && containerRef.current) {
      const container = containerRef.current
      const stepHeight = container.firstElementChild!.getBoundingClientRect().height
      const index = Math.round(container.scrollTop / stepHeight)
      const value = index + 1
      if (prevValue.current !== value) {
        onChange(value)
        prevValue.current = value
      }
    }
  }, [isScrolling])
  // 默认滚动到今天
  useEffect(() => {
    if (containerRef.current && value > 0) {
      const container = containerRef.current
      const stepHeight = container.firstElementChild!.getBoundingClientRect().height
      container.scrollTop = stepHeight * (value - 1)
    }
  }, [containerRef.current, value])
  return (
    <div ref={containerRef} className='aspect-[3/2] w-[calc((100vw-3px)/4)] overflow-y-scroll no-scrollbar snap-y snap-mandatory'>
      {Array(getMonthLastDay(currentSelectedMonth)).fill(0).map((_, i) => (
        <div key={i} className='w-full h-full snap-start flex items-center justify-center'>
          <div className='flex flex-col justify-center'>
            <span className='text-center'>{i + 1}日</span>
            {(dayjs().get('date') === i + 1) && (
              <span className='text-[.8rem] text-center'>今天</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}