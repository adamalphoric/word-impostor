export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }
  return (
    <div className="flex flex-col items-center select-none">
      <div className={`font-black tracking-tight ${sizes[size]}`}>
        <span className="text-white">WORD</span>
        <span className="text-game-secondary"> IMPOSTOR</span>
      </div>
      {size !== 'sm' && (
        <div className="text-game-muted text-sm mt-1 tracking-widest uppercase">
          Social Deduction Party Game
        </div>
      )}
    </div>
  )
}
