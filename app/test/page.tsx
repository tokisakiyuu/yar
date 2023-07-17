import fs from 'fs'
import * as csv from 'fast-csv'
import { pushFileChanges } from '@/lib/github'
import { ExpendRecord } from '@/lib/types'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { jsonToCsv } from '@/lib/csv'

interface MonthGroup {
  month: string
  records: ExpendRecord[]
}

export default async function Test() {
  const records = await Promise.all([
    ...(await parse('鲨鱼记账明细(2019-7-15至2020-7-14).csv')),
    ...(await parse('鲨鱼记账明细(2020-7-15至2021-7-14).csv')),
    ...(await parse('鲨鱼记账明细(2021-7-15至2022-7-14).csv')),
    ...(await parse('鲨鱼记账明细(2022-7-15至2023-7-15).csv'))
  ])
  const monthMap: Map<string, ExpendRecord[]> = new Map()
  for (const item of records) {
    const date = parseTime(item['日期'].trim())
    const month = date.format('YYYY-MM')
    if (!monthMap.has(month)) monthMap.set(month, [])
    const records = monthMap.get(month) as ExpendRecord[]
    const symbol = item['收支类型'] === '支出' ? -1 : 1
    records.push({
      rid: nanoid(),
      amount: String(Number(item['金额']) * symbol),
      date: date.format('YYYY-M-D'),
      kind: item['类别'],
      remark: item['备注']
    })
  }
  console.log('推送中...')
  await pushFileChanges({
    additions: await Promise.all(Array.from(monthMap.keys()).map(async m => {
      return {
        path: `${m}.csv`,
        contents: await jsonToCsv(monthMap.get(m) as ExpendRecord[])
      }
    }))
  })
  console.log('完成')

  return (
    <div></div>
  )
}

async function parse(filename: string) {
  return new Promise<any[]>((resolve, reject) => {
    const result: any[] = []
    const source = fs.readFileSync(`${process.cwd()}/build/${filename}`).toString('utf16le')
    csv.parseString(source, { headers: true, delimiter: '	' })
      .on('error', reject)
      .on('data', (row: any) => result.push(row))
      .on('end', () => resolve(result))
  })
}

/**
 * e.g, 2019年10月22日
 */
function parseTime(date: string) {
  const matchArr = date.match(/(\d{4})年(\d{2})月(\d{2})日/)
  if (!matchArr) {
    throw new Error('date match faild.')
  }
  const [_, y, m, d] = matchArr
  return dayjs().year(Number(y)).month(Number(m) - 1).date(Number(d))
}