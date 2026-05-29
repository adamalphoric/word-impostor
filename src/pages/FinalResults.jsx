import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { resetToLobby } from '../services/gameService'
import { getPlayerInitials, getAvatarColor } from '../utils/helpers'
import Button from '../components/Button'
import Card from '../components/Card'
import Logo from '../components/Logo'
import { useSound } from '../hooks/useSound'

export default function FinalResults() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { players, playerId, isHost, settings } = useGame()
  const { play } = useSound()

  const sorted = Object.entries(players).sort(([, a], [, b]) => (b.score || 0) - (a.score || 0))
  const winner = sorted[0]

  async function handlePlayAgain() {
    play('roundStart')
    await resetToLobby(roomCode)
    navigate(`/lobby/${roomCode}`)
  }

  async function handleHome() {
    navigate('/')
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 animate-bounce-in">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-4xl font-black text-game-text">Game Over!</h1>
          {winner && (
            <p className="text-game-muted mt-2">
              <span className="text-game-warning font-bold">{winner[1].name}</span> wins with {winner[1].score} point{winner[1].score !== 1 ? 's' : ''}!
            </p>
          )}
        </div>

        <Card className="mb-6 animate-slide-up">
          <h2 className="font-bold text-game-text mb-4 text-center text-lg">Final Standings</h2>
          <div className="space-y-3">
            {sorted.map(([id, player], index) => {
              const isMe = id === playerId
              const medal = medals[index] || `${index + 1}.`
              const isWinner = index === 0

              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isWinner
                      ? 'bg-game-warning/10 border border-game-warning/30'
                      : isMe
                      ? 'bg-game-primary/10 border border-game-primary/30'
                      : 'bg-game-card border border-game-border'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">{medal}</span>
                  <div className={`${getAvatarColor(player.name)} w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                    {getPlayerInitials(player.name)}
                  </div>
                  <div className="flex-1">
                    <span className={`font-semibold ${isMe ? 'text-game-primary' : 'text-game-text'}`}>
                      {player.name}
                      {isMe && <span className="text-xs text-game-muted ml-1">(you)</span>}
                    </span>
                  </div>
                  <div className={`font-black text-xl ${isWinner ? 'text-game-warning' : 'text-game-text'}`}>
                    {player.score || 0}
                    <span className="text-sm font-normal text-game-muted ml-1">pts</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-3 animate-slide-up">
          {isHost && (
            <Button fullWidth size="xl" onClick={handlePlayAgain} sound="roundStart">
              🎮 Play Again
            </Button>
          )}
          <Button fullWidth variant="ghost" onClick={handleHome}>
            🏠 Back to Home
          </Button>
        </div>

        {!isHost && (
          <Card className="mt-4 text-center">
            <p className="text-game-muted text-sm">Waiting for host to start a new game...</p>
          </Card>
        )}
      </div>
    </div>
  )
}
