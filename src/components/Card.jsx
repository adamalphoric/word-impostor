export default function Card({ children, className = '', glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-game-card border border-game-border rounded-2xl p-6
        ${glow ? 'animate-glow' : ''}
        ${onClick ? 'cursor-pointer hover:bg-game-cardHover transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
