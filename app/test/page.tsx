'use client'

import { fetchFileContent } from '@/lib/github'

export default async function Test() {
  const content = await fetchFileContent('myfile.txt')
  return (
    <div>
      <h3>file1</h3>
      <p>{content}</p>
    </div>
  )
}