import { Fragment } from 'react'
import { atom, useAtom, useSetAtom } from 'jotai'
import cx from 'clsx'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import DatePicker from './DatePicker'
import { ExpendRecord } from '@/lib/source'

interface Props {
  show: boolean
  onClose: () => void
  onComplete: (data: ExpendRecord) => void
  onDelete: () => void
}

export default function Collector({ show, onClose, onComplete, onDelete }: Props) {
  const [amount, setAmount] = useAtom(amountAtom)
  const [isExpend, setExpend] = useAtom(isExpendAtom)
  const [step, setStep] = useAtom(stepAtom)
  const [kind, setKind] = useAtom(kindAtom)
  const [remark, setRemark] = useAtom(remarkAtom)
  const [date, setDate] = useAtom(dateAtom)
  const [showDatePicker, setShowDatePicker] = useAtom(showDatePickerAtom)
  const handleComplete = () => {
    onComplete({
      rid: uuidv4(),
      amount: Number(amount) * (isExpend ? -1 : 1),
      kind,
      createAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      date: dayjs(date).format('YYYY-MM'),
      remark
    })
  }
  return (
    <>
      <div onClick={onClose} className={`fixed top-0 left-0 w-full h-full ${cx(!show && 'hidden')}`} />
      <div className={`fixed bottom-0 w-full bg-white rounded-t-2xl shadow-[0_20px_20px_20px_rgba(0,0,0,.2)] transition-transform ${cx({ 'translate-y-full': !show  })}`}>
        <div className="p-3 py-5 border-b-[#EDEDED] border-b">
          <div className="flex">
            <input className="flex-1 mr-6 outline-none text-sm" type="text" placeholder="未分类" value={kind} onChange={(e) => setKind(e.target.value)} />
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
            <div className="aspect-[3/2] w-[calc((100vw-3px)/4)] flex justify-center items-center overflow-hidden active:bg-[#f3f3f3]" onClick={() => setShowDatePicker(true)}>
              {dayjs(date).isSame(dayjs(), 'day')
                ? '今天'
                : dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day')
                  ? '昨天'
                  : dayjs(date).format('YYYY/M/D')
              }
            </div>
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
      <DatePicker
        show={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onChange={date => setDate(date)}
      />
    </>
  )
}

const amountAtom = atom('0')
const isExpendAtom = atom(true)
const stepAtom = atom(0)
const kindAtom = atom('')
const remarkAtom = atom('')
const dateAtom = atom(new Date())
const showDatePickerAtom = atom(false)

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
  return (
    <div className="w-full h-full overflow-y-scroll no-scrollbar">
      {groupByNumber(tempKinds, 3).map((row, ri) => (
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

function RemarkSelector() {
  const [remark, setRemark] = useAtom(remarkAtom)
  const handleRemark = (addRemark: string) => {
    const remarkList = remark.split('、').filter(r => r)
    if (remarkList.includes(addRemark)) {
      setRemark(remarkList.filter(r => r !== addRemark).join('、'))
    } else {
      remarkList.push(addRemark)
      setRemark(remarkList.join('、'))
    }
  }
  return (
    <div className="flex p-3 gap-x-5 gap-y-3 flex-wrap">
      {tempRemarks.map((remark, i) => (
        <span key={i} className="underline underline-offset-2 decoration-[#6C97FC]" onClick={() => handleRemark(remark)}>{remark}</span>
      ))}
    </div>
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