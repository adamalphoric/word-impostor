import { useEffect, useRef } from 'react'

export default function QRCode({ value, size = 150 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size
    ctx.fillStyle = '#1e1e2e'
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#7c3aed'
    ctx.font = `${size * 0.08}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText('QR: ' + value, size / 2, size / 2)
  }, [value, size])

  return (
    <div className="bg-game-card p-4 rounded-xl inline-flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded" />
      <p className="text-xs text-game-muted">Scan to join</p>
    </div>
  )
}
