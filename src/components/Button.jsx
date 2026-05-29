import { useSound } from '../hooks/useSound'

const variants = {
  primary: 'bg-game-primary hover:bg-game-primaryHover text-white shadow-lg shadow-purple-900/30',
  secondary: 'bg-game-secondary hover:bg-game-secondaryHover text-white shadow-lg shadow-pink-900/30',
  success: 'bg-game-success hover:bg-emerald-600 text-white shadow-lg shadow-green-900/30',
  danger: 'bg-game-danger hover:bg-red-600 text-white shadow-lg shadow-red-900/30',
  ghost: 'bg-transparent hover:bg-white/10 text-game-text border border-game-border',
  outline: 'bg-transparent border-2 border-game-primary text-game-primary hover:bg-game-primary hover:text-white',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  fullWidth = false,
  sound = 'click',
  ...props
}) {
  const { play } = useSound()

  function handleClick(e) {
    if (disabled || loading) return
    if (sound) play(sound)
    onClick?.(e)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        font-semibold transition-all duration-150 active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        flex items-center justify-center gap-2 select-none
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
