import { getPlayerInitials, getAvatarColor } from '../utils/helpers'

function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  return (
    <div className={`${getAvatarColor(name)} ${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {getPlayerInitials(name)}
    </div>
  )
}

export default function PlayerList({
  players = {},
  currentPlayerId,
  hostId,
  showReady = false,
  showScore = false,
  showKick = false,
  onKick,
  showVoteCount = false,
  voteCounts = {},
  highlightEliminated = null,
  impostorId = null,
  showImpostor = false,
}) {
  const playerList = Object.entries(players).sort(([, a], [, b]) => (b.score || 0) - (a.score || 0))

  return (
    <div className="space-y-2">
      {playerList.map(([id, player]) => {
        const isMe = id === currentPlayerId
        const isHost = id === hostId
        const isEliminated = id === highlightEliminated
        const isImpostor = showImpostor && id === impostorId
        const voteCount = voteCounts[id] || 0

        return (
          <div
            key={id}
            className={`
              flex items-center gap-3 p-3 rounded-xl border transition-all
              ${isMe ? 'border-game-primary bg-game-primary/10' : 'border-game-border bg-game-card'}
              ${isEliminated ? 'border-game-danger bg-game-danger/10' : ''}
              ${isImpostor ? 'border-red-400 bg-red-900/20' : ''}
            `}
          >
            <Avatar name={player.name} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold truncate ${isMe ? 'text-game-primary' : 'text-game-text'}`}>
                  {player.name}
                </span>
                {isMe && <span className="text-xs text-game-muted">(you)</span>}
                {isHost && (
                  <span className="text-xs bg-game-warning/20 text-game-warning px-2 py-0.5 rounded-full">
                    Host
                  </span>
                )}
                {isImpostor && (
                  <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full animate-pulse">
                    IMPOSTOR
                  </span>
                )}
              </div>

              {showScore && (
                <div className="text-sm text-game-muted">
                  {player.score || 0} point{player.score !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {showReady && (
                <span
                  className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-game-success' : 'bg-game-border'}`}
                  title={player.isReady ? 'Ready' : 'Not ready'}
                />
              )}

              {showVoteCount && voteCount > 0 && (
                <span className="bg-game-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {voteCount} vote{voteCount !== 1 ? 's' : ''}
                </span>
              )}

              {showKick && !isMe && onKick && (
                <button
                  onClick={() => onKick(id)}
                  className="text-game-muted hover:text-game-danger text-xs transition-colors px-2 py-1"
                >
                  Kick
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
