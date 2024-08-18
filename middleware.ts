import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (!isAuthenticated(req)) {
    return NextResponse.json(
      { ok: false, msg: 'authentication failed' },
      { status: 401 },
    )
  }

  return NextResponse.next()
}

function isAuthenticated(req: NextRequest) {
  const { headers } = req
  const value = headers.get('authorization')
  return (
    value === `token ${process.env.APP_ACCESS_TOKEN}` ||
    value === `Bearer ${process.env.APP_ACCESS_TOKEN}`
  )
}
