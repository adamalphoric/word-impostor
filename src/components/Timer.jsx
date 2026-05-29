import { useState, useEffect, useRef } from 'react'
import { formatTime } from '../utils/helpers'
import { useSound } from '../hooks/useSound'

export default function Timer({ endTime, onExpire, showWarning = true, warningSeconds = 10 }) {
  const [remaining, setRemaining] = useState(0)
  const { play } = useSound()
  const lastTickRef = useRef(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!endTime) return
    expiredRef.current = false

    function tick() {
      const now = Date.now()
      const secs = Math.max(0, Math.ceil((endTime - now) / 1000))
      setRemaining(secs)

      if (secs <= warningSeconds && secs > 0 && showWarning) {
        const prev = lastTickRef.current
        if (prev !== secs) {
          lastTickRef.current = secs
          play(secs <= 3 ? 'timerWarning' : 'timerTick')
        }
      }

      if (secs === 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpire?.()
      }
    }

    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [endTime, onExpire, showWarning, warningSeconds, play])

  if (!endTime) return null

  const isWarning = remaining <= warningSeconds && remaining > 0
  const isDanger = remaining <= 3

  return (
    <div
      className={`
        font-mono font-bold text-3xl text-center transition-colors
        ${isDanger ? 'text-game-danger animate-pulse' : isWarning ? 'text-game-warning' : 'text-game-text'}
      `}
    >
      {formatTime(remaining)}
    </div>
  )
}
