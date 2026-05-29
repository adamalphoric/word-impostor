import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { voteToPlay, startGame, resetToLobby } from '../services/gameService'
import { PHASES } from '../utils/constants'
import { getPlayerInitials, getAvatarColor } from '../utils/helpers'
import Button from '../components/Button'
import Card from '../components/Card'
import PlayerList from '../components/PlayerList'
import { useSound } from '../hooks/useSound'

export default function Results() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { playerId, players, phase, game, settings, continueVotes, isHost } = useGame()
  const { play } = useSound()
  const [myVote, setMyVote] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (phase === PHASES.FINAL_RESULTS) navigate(`/final/${roomCode}`)
    else if (phase === PHASES.WORD_REVEAL) navigate(`/reveal/${roomCode}`)
    else if (phase === PHASES.LOBBY) navigate(`/lobby/${roomCode}`)
  }, [phase, roomCode, navigate])

  useEffect(() => {
    if (game?.impostorCaught !== undefined) {
      setTimeout(() => {
        setRevealed(true)
        play(game.impostorCaught ? 'victory' : 'defeat')
      }, 500)
    }
  }, [game, play])

  const impostor = players[game?.impostorId]
  const impostorCaught = game?.impostorCaught
  const isLastRound = game?.isLastRound
  const isTie = game?.isTie
  const eliminated = players[game?.eliminated]

  const totalPlayers = Object.keys(players).length
  const totalVotes = Object.keys(continueVotes || {}).length
  const continueCount = Object.values(continueVotes || {}).filter(Boolean).length
  const endCount = totalVotes - continueCount
  const iVoted = continueVotes?.[playerId] !== undefined

  async function handleContinueVote(cont) {
    setMyVote(cont)
    play('click')
    await voteToPlay(roomCode, playerId, cont)
  }

  async function handleHostStart() {
    play('roundStart')
    await startGame(roomCode)
  }

  async function handleHostEnd() {
    navigate(`/final/${roomCode}`)
  }

  async function handleReturnToLobby() {
    play('click')
    await resetToLobby(roomCode)
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Result banner */}
        {revealed && (
          <div className={`text-center mb-6 animate-bounce-in`}>
            {impostorCaught ? (
              <div>
                <div className="text-7xl mb-3">🎉</div>
                <h1 className="text-4xl font-black text-game-success">IMPOSTOR CAUGHT!</h1>
                <p className="text-game-muted mt-2">The town wins this round!</p>
              </div>
            ) : (
              <div>
                <div className="text-7xl mb-3">😈</div>
                <h1 className="text-4xl font-black text-game-danger">IMPOSTOR WINS!</h1>
                <p className="text-game-muted mt-2">They fooled everyone!</p>
              </div>
            )}
          </div>
        )}

        {/* Word reveal */}
        {revealed && (
          <Card className="mb-4 text-center animate-slide-up">
            <p className="text-game-muted text-sm uppercase tracking-widest mb-1">The secret word was</p>
            <div className="text-4xl font-black text-game-text my-2">{game?.word}</div>
            <div className="text-game-muted text-sm">{game?.category}</div>
          </Card>
        )}

        {/* Impostor reveal */}
        {revealed && impostor && (
          <Card className={`mb-4 animate-slide-up border-2 ${impostorCaught ? 'border-game-success' : 'border-game-danger'}`}>
            <div className="flex items-center gap-4">
              <div className={`${getAvatarColor(impostor.name)} w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0`}>
                {getPlayerInitials(impostor.name)}
              </div>
              <div>
                <p className="text-game-muted text-sm">The impostor was</p>
                <p className="text-2xl font-black text-game-text">{impostor.name}</p>
                {game?.impostorId === playerId && (
                  <p className="text-xs text-game-primary mt-1">(that's you!)</p>
                )}
              </div>
              <div className="ml-auto text-4xl">
                {impostorCaught ? '🚔' : '🏃'}
              </div>
            </div>
            {isTie && (
              <p className="text-game-warning text-sm mt-3 text-center">
                ⚠️ It was a tie — nobody was eliminated
              </p>
            )}
            {eliminated && !isTie && !impostorCaught && (
              <p className="text-game-danger text-sm mt-3 text-center">
                {eliminated.name} was eliminated instead
              </p>
            )}
          </Card>
        )}

        {/* Scores */}
        {revealed && (
          <Card className="mb-4 animate-slide-up">
            <h3 className="font-bold text-game-text mb-3">Scoreboard</h3>
            <PlayerList
              players={players}
              showScore
              currentPlayerId={playerId}
              hostId={null}
              impostorId={game?.impostorId}
              showImpostor
            />
          </Card>
        )}

        {/* Continue voting */}
        {revealed && !isLastRound && !settings.autoNextRound && !isHost && (
          <Card className="mb-4 animate-slide-up">
            <h3 className="font-bold text-game-text mb-3 text-center">Play again?</h3>
            <div className="flex gap-3">
              <Button
                fullWidth
                variant={myVote === true ? 'success' : 'ghost'}
                onClick={() => handleContinueVote(true)}
                disabled={iVoted}
                sound="click"
              >
                👍 Continue ({continueCount})
              </Button>
              <Button
                fullWidth
                variant={myVote === false ? 'danger' : 'ghost'}
                onClick={() => handleContinueVote(false)}
                disabled={iVoted}
                sound="click"
              >
                🛑 End ({endCount})
              </Button>
            </div>
            <p className="text-xs text-game-muted text-center mt-2">
              {totalVotes}/{totalPlayers} voted
            </p>
          </Card>
        )}

        {/* Host controls */}
        {isHost && revealed && (
          <div className="space-y-3 animate-slide-up">
            {!isLastRound && (
              <Button fullWidth size="lg" onClick={handleHostStart} sound="roundStart">
                🔄 Next Round
              </Button>
            )}
            <Button fullWidth variant={isLastRound ? 'primary' : 'ghost'} size={isLastRound ? 'lg' : 'md'} onClick={handleHostEnd}>
              📊 View Final Results
            </Button>
            <Button fullWidth variant="ghost" size="sm" onClick={handleReturnToLobby}>
              ↩ Return to Lobby
            </Button>
          </div>
        )}

        {settings.autoNextRound && !isLastRound && !isHost && revealed && (
          <Card className="text-center">
            <p className="text-game-muted animate-pulse">Next round starting soon...</p>
          </Card>
        )}
      </div>
    </div>
  )
}
