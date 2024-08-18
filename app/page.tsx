'use client'
import { useEffect } from 'react'
import { useLocalStorage, useSearchParam } from 'react-use'
import useSWR from 'swr'

export default function Home() {
  const token = useToken()
  const { data, isLoading, error } = useSWR(
    '/api/list?skip=0&limit=99',
    async key => {
      const res = await fetch(key, {
        headers: {
          Authorization: `token ${token}`,
        },
      })
      if (res.ok) {
        return res.json()
      } else {
        throw res.statusText
      }
    },
  )

  const records = data?.records ?? []
  const total = data?.total ?? 0

  if (isLoading) return 'loading...'
  if (error) return <pre style={{ color: 'red' }}>{error}</pre>

  if (!records.length) return '(empty)'

  return (
    <main>
      <div>
        {(records as any[]).map(record => (
          <div key={record._id}>
            <pre>{JSON.stringify(record, null, 2)}</pre>
          </div>
        ))}
      </div>

      <div>total: {total}</div>
    </main>
  )
}

function useToken() {
  const incomeToken = useSearchParam('token')
  const [token, setToken] = useLocalStorage<string>('token')

  useEffect(() => {
    if (typeof incomeToken === 'string') {
      setToken(incomeToken)
    }
  }, [incomeToken, token])

  return incomeToken || token
}
