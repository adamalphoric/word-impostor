import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { processResults } from '../services/gameService'
import { PHASES } from '../utils/constants'
import { getVoteCounts, getMostVoted, getPlayerInitials, getAvatarColor } from '../utils/helpers'
import Card from '../components/Card'
import Button from '../components/Button'
import { useSound } from '../hooks/useSound'

export default function VoteReveal() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { players, votes, phase, game, isHost } = useGame()
  const { play } = useSound()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (phase === PHASES.RESULTS) navigate(`/results/${roomCode}`)
    else if (phase === PHASES.LOBBY) navigate(`/lobby/${roomCode}`)
  }, [phase, roomCode, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true)
      play('reveal')
    }, 800)
    return () => clearTimeout(timer)
  }, [play])

  const voteCounts = getVoteCounts(votes, players)
  const { winners, count } = getMostVoted(voteCounts)
  const playerList = Object.entries(players).sort(([a], [b]) => (voteCounts[b] || 0) - (voteCounts[a] || 0))

  async function handleContinue() {
    play('click')
    await processResults(roomCode)
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl font-black text-game-text">Vote Results</h1>
          <p className="text-game-muted text-sm mt-1">Here's how everyone voted</p>
        </div>

        <div className="space-y-3 mb-6">
          {playerList.map(([id, player], index) => {
            const count2 = voteCounts[id] || 0
            const isHighest = winners.includes(id) && count > 0
            const pct = Object.keys(players).length ? (count2 / Object.keys(players).length) * 100 : 0

            return (
              <div
                key={id}
                className={`animate-slide-up flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isHighest ? 'border-game-danger bg-game-danger/10' : 'border-game-border bg-game-card'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${getAvatarColor(player.name)} w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                  {getPlayerInitials(player.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-game-text truncate">{player.name}</span>
                    <span className={`font-bold text-sm ml-2 flex-shrink-0 ${isHighest ? 'text-game-danger' : 'text-game-muted'}`}>
                      {count2} vote{count2 !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {revealed && (
                    <div className="h-2 bg-game-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isHighest ? 'bg-game-danger' : 'bg-game-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {winners.length > 1 && count > 0 && (
          <Card className="mb-4 text-center border-game-warning">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="font-bold text-game-warning">It's a TIE!</p>
            <p className="text-game-muted text-sm mt-1">
              {winners.map((id) => players[id]?.name).join(' and ')} are tied.
            </p>
          </Card>
        )}

        {isHost && (
          <Button fullWidth size="lg" onClick={handleContinue} className="mt-2">
            Continue →
          </Button>
        )}

        {!isHost && (
          <Card className="text-center">
            <p className="text-game-muted">Waiting for host to continue...</p>
          </Card>
        )}
      </div>
    </div>
  )
}
