'use client'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

export default async function Test() {
  const d = dayjs().add(1, 'month').set('date', 1).subtract(1, 'day').get('date')
  return (
    <div>
      <p>{d}</p>
    </div>
  )
}