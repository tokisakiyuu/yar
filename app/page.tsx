'use client'

import { useAtomValue } from 'jotai'
import { appTokenAtom } from './components/state'
import AppMain from './components/AppMain'
import Login from './components/Login'

export default function Home() {
  const appToken = useAtomValue(appTokenAtom)
  return !appToken ? <Login /> : <AppMain />
}
