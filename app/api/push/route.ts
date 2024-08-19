import { jsonToCsv } from '@/lib/csv'
import { attachDB } from '@/lib/mongo'
import { Octokit } from '@octokit/rest'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { NextResponse } from 'next/server'

dayjs.extend(utc)
dayjs.extend(timezone)

export async function GET() {
  const db = await attachDB()
  const month = dayjs().tz('Asia/Chongqing').startOf('month')

  const records = await db
    .collection('records')
    .find({
      date: {
        $gte: month.clone().toDate(),
        $lte: month.clone().endOf('month').toDate(),
      },
    })
    .sort('date', 'asc')
    .toArray()

  const csv = await jsonToCsv(
    records.map(({ _id, amount, kind, remark, date }) => ({
      rid: String(_id),
      amount,
      kind,
      remark,
      date: dayjs(date).tz('Asia/Chongqing').format('YYYY-MM-DD HH:mm:ss'),
    })),
  )

  await pushChange(`${month.clone().format('YYYY-MM')}.csv`, csv)

  return NextResponse.json(records)
}

async function pushChange(path: string, content: string) {
  const octokit = new Octokit({
    auth: process.env.REPO_ACCESS_TOKEN,
  })
  const sha = await octokit.repos
    .getContent({
      owner: process.env.REPO_OWNER as string,
      repo: process.env.REPO_NAME as string,
      ref: process.env.REPO_BRANCH as string,
      path,
    })
    .then(res => (res.data as any).sha)
    .catch(reason =>
      reason.status === 404 ? undefined : Promise.reject(reason),
    )

  await octokit.repos.createOrUpdateFileContents({
    owner: process.env.REPO_OWNER as string,
    repo: process.env.REPO_NAME as string,
    branch: process.env.REPO_BRANCH as string,
    path,
    content: Buffer.from(content, 'utf8').toString('base64'),
    sha,
    message: 'sync',
  })
}

export const dynamic = 'force-dynamic'
