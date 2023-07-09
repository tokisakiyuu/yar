import { useSetAtom } from "jotai"
import { useState } from "react"
import { appTokenAtom } from "./state"

export default function Login() {
  const [value, setValue] = useState('')
  const setAppToken = useSetAtom(appTokenAtom)
  return (
    <div className="h-[100vh] flex justify-center items-center">
      <div>
        <div className="text-xl font-bold mb-2">请提供App Token</div>
        <input
          type="text"
          className="w-[60vw] border border-blue-500 outline-none rounded text-lg p-2"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setAppToken(value)}
        />
      </div>
    </div>
  )
}