import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const inputToken = getToken(request)
  if (!inputToken) {
    return new NextResponse('Authentication required', { status: 401 })
  }
  if (inputToken !== process.env.APP_ACCESS_TOKEN) {
    return new NextResponse('Authentication failed', { status: 401 })
  }
  return NextResponse.next()
}

function getToken(req: NextRequest) {
  const url = new URL(req.url)
  const tokenInQuery = url.searchParams.get('token')
  const authheader = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  const tokenInHeader = authheader && authheader.split(' ').pop()
  return tokenInHeader || tokenInQuery || ''
}

export const config = {
  matcher: '/api/:function*',
}