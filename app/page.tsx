'use client'
import useSWR from 'swr'

export default function Home() {
  const { data, isLoading } = useSWR('/api/list?skip=0&limit=99', key =>
    fetch(key).then(res => res.json()),
  )

  const records = data?.records ?? []
  const total = data?.total ?? 0
  if (isLoading) return 'loading...'
  if (!records.length) return '(empty)'

  return (
    <main>
      <div>
        {(records as any[]).map(record => (
          <div>
            <pre>{JSON.stringify(record, null, 2)}</pre>
          </div>
        ))}
      </div>

      <div>total: {total}</div>
    </main>
  )
}
