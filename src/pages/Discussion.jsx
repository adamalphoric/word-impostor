import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { startVoting } from '../services/gameService'
import { PHASES } from '../utils/constants'
import Button from '../components/Button'
import Card from '../components/Card'
import Timer from '../components/Timer'
import PlayerList from '../components/PlayerList'
import { useSound } from '../hooks/useSound'

const DISCUSSION_PROMPTS = [
  'Everyone gives ONE clue word. No sentences!',
  'Go around the circle — each person says one word.',
  'Listen carefully. Vague answers might mean impostor.',
  'The impostor must bluff without knowing the word.',
  'Don\'t give too obvious of a clue — the impostor will catch on!',
  'Watch for hesitation. The impostor is making it up!',
  'Discuss patterns: who gave the weirdest clue?',
  'Remember: clues should relate to the word, not the category.',
]

export default function Discussion() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { game, players, phase, isHost, settings } = useGame()
  const { play } = useSound()

  const prompt = DISCUSSION_PROMPTS[Math.floor(Math.random() * DISCUSSION_PROMPTS.length)]

  useEffect(() => {
    if (phase === PHASES.VOTING) navigate(`/vote/${roomCode}`)
    else if (phase === PHASES.RESULTS) navigate(`/results/${roomCode}`)
    else if (phase === PHASES.LOBBY) navigate(`/lobby/${roomCode}`)
    else if (phase === PHASES.WORD_REVEAL) navigate(`/reveal/${roomCode}`)
  }, [phase, roomCode, navigate])

  async function handleTimerEnd() {
    if (!isHost) return
    play('roundStart')
    await startVoting(roomCode, settings.votingTime)
  }

  async function handleSkip() {
    play('click')
    await startVoting(roomCode, settings.votingTime)
  }

  const playerCount = Object.keys(players).length
  const roundInfo = `Round ${game?.currentRound || 1}${!settings.endlessMode ? ` / ${settings.maxRounds}` : ''}`

  return (
    <div className="min-h-screen bg-game-bg flex flex-col p-4 md:p-6">
      <div className="max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="text-game-muted text-xs uppercase tracking-widest mb-1">{roundInfo}</div>
          <h1 className="text-3xl font-black text-game-text">Discussion Time</h1>
        </div>

        {/* Timer */}
        {game?.discussionEndTime && (
          <Card className="mb-4 text-center">
            <Timer
              endTime={game.discussionEndTime}
              onExpire={handleTimerEnd}
              warningSeconds={15}
            />
            <p className="text-game-muted text-sm mt-1">Until voting begins</p>
          </Card>
        )}

        {/* Prompt card */}
        <Card className="mb-4 bg-game-primary/10 border-game-primary/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-game-text font-medium">{prompt}</p>
              <p className="text-game-muted text-xs mt-1">Talk out loud with your group!</p>
            </div>
          </div>
        </Card>

        {/* Players */}
        <Card className="mb-4">
          <h3 className="font-bold text-game-text mb-3">Players ({playerCount})</h3>
          <PlayerList players={players} />
        </Card>

        {/* Instructions */}
        <Card className="mb-4 text-center">
          <div className="text-4xl mb-2">🗣️</div>
          <p className="text-game-text font-medium">Give verbal clues in real life!</p>
          <p className="text-game-muted text-sm mt-1">
            Everyone except the impostor knows the word.
            Discuss, debate, and try to find the spy!
          </p>
        </Card>

        {isHost && (
          <Button variant="ghost" fullWidth onClick={handleSkip}>
            Skip to Voting →
          </Button>
        )}
      </div>
    </div>
  )
}
