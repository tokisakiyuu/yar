import { useEffect, useRef, useState } from 'react'
import { useMount, useScrolling, useDebounce } from 'react-use'
import cx from 'clsx'

interface Props {
  show: boolean
  onClose: () => void
  onChange: (date: Date) => void
}

export default function DatePicker({ show, onClose, onChange }: Props) {
  const [today] = useState(new Date())
  const [year, setYear] = useState<number>(today.getFullYear())
  const [month, setMonth] = useState<number>(today.getMonth() + 1)
  const [date, setDate] = useState<number>(today.getDate())
  useDebounce(() => {
    onChange(new Date(year, month - 1, date))
  }, 150, [year, month, date])
  return (
    <>
      <div onClick={onClose} className={`fixed top-0 left-0 w-full h-full ${cx(!show && 'hidden')}`} />
      <div className={`fixed bottom-[var(--safe-area-inset-bottom)] w-full rounded-t-2xl bg-white h-[calc((100vw-3px)/4/1.5*4+3px)] transition-transform`} style={{ transform: `translateY(${!show ? 'calc(100% + var(--safe-area-inset-bottom))' : 0})` }}>
        <div className='absolute top-1/2 translate-y-[-50%] px-2 h-[14.3%] w-full'>
          <div className='w-full h-full rounded bg-[#f5f5f5]' />
        </div>
        <div className='absolute w-[calc(100%-16px)] h-[calc(100%-4px)] top-[4px] left-[50%] translate-x-[-50%] flex justify-around'>
          <YearColumn onChange={value => setYear(value)} promptValue={[]} />
          <MonthColumn onChange={value => setMonth(value)} promptValue={[]} />
          <DateColumn onChange={value => setDate(value)} promptValue={[year, month]} />
        </div>
      </div>
    </>
  )
}

function getScrollYIndex(container: HTMLDivElement) {
  const stepHeight = container.firstElementChild!.getBoundingClientRect().height
  return Math.round(container.scrollTop / stepHeight)
}

interface ColumnProps {
  onChange: (value: number) => void
  promptValue: number[]
}

function YearColumn({ onChange }: ColumnProps) {
  const year = (new Date()).getFullYear()
  const years = Array(20).fill(0).map((_, i) => year - i)
  const yearContainer = useRef<HTMLDivElement>(null)
  const isYearScrolling = useScrolling(yearContainer)
  const prevValue = useRef<number | null>(null)
  useEffect(() => {
    if (!isYearScrolling && yearContainer.current) {
      const index = getScrollYIndex(yearContainer.current)
      const value = years[index]
      if (prevValue.current !== value) {
        onChange(value)
        prevValue.current = value
      }
    }
  }, [isYearScrolling])
  useMount(() => {
    onChange(years[0])
  })
  return (
    <div ref={yearContainer} className='h-full w-[30%] overflow-y-scroll no-scrollbar snap-y snap-mandatory'>
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start' />
      ))}
      {years.map((y, i) => (
        <div key={i} className='flex items-center justify-end h-[14.3%] snap-start'>{y}年</div>
      ))}
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start' />
      ))}
    </div>
  )
}

function MonthColumn({ onChange }: ColumnProps) {
  const [currentMonth] = useState(() => (new Date()).getMonth() + 1)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useScrolling(containerRef)
  const prevValue = useRef<number | null>(null)
  useEffect(() => {
    if (!isScrolling && containerRef.current) {
      const index = getScrollYIndex(containerRef.current)
      const value = index + 1
      if (prevValue.current !== value) {
        onChange(value)
        prevValue.current = value
      }
    }
  }, [isScrolling])
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const stepHeight = container.firstElementChild!.getBoundingClientRect().height
      container.scrollTop = stepHeight * (currentMonth - 1)
    }
  }, [containerRef.current])
  useMount(() => {
    onChange(currentMonth)
  })
  return (
    <div ref={containerRef} className='h-full w-[30%] overflow-y-scroll no-scrollbar snap-y snap-mandatory'>
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start' />
      ))}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((y, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start'>{y}月</div>
      ))}
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start' />
      ))}
    </div>
  )
}

function DateColumn({ onChange, promptValue }: ColumnProps) {
  const [todayDate] = useState(() => (new Date()).getDate())
  const values = Array((new Date(promptValue[0], promptValue[1], 0)).getDate()).fill(0).map((_, i) => i + 1)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useScrolling(containerRef)
  const prevValue = useRef<number | null>(null)
  useEffect(() => {
    if (!isScrolling && containerRef.current) {
      const index = getScrollYIndex(containerRef.current)
      const value = index + 1
      if (prevValue.current !== value) {
        onChange(value)
        prevValue.current = value
      }
    }
  }, [isScrolling, ...promptValue])
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const stepHeight = container.firstElementChild!.getBoundingClientRect().height
      container.scrollTop = stepHeight * (todayDate - 1)
    }
  }, [containerRef.current])
  useMount(() => {
    onChange(todayDate)
  })
  return (
    <div ref={containerRef} className='h-full w-[30%] overflow-y-scroll no-scrollbar snap-y snap-mandatory'>
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start' />
      ))}
      {values.map((y, i) => (
        <div key={i} className='flex items-center justify-start h-[14.3%] snap-start'>{y}日</div>
      ))}
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className='flex items-center justify-center h-[14.3%] snap-start' />
      ))}
    </div>
  )
}
