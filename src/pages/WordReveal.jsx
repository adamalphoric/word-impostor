import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { confirmSeenWord, startDiscussion } from '../services/gameService'
import { PHASES, IMPOSTOR_MODES } from '../utils/constants'
import Button from '../components/Button'
import Card from '../components/Card'
import { useSound } from '../hooks/useSound'

export default function WordReveal() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { playerId, players, myWordAssignment, phase, settings, game, isHost } = useGame()
  const { play } = useSound()
  const [revealed, setRevealed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (phase === PHASES.DISCUSSION) navigate(`/game/${roomCode}`)
    else if (phase === PHASES.VOTING) navigate(`/game/${roomCode}`)
    else if (phase === PHASES.RESULTS) navigate(`/results/${roomCode}`)
    else if (phase === PHASES.LOBBY) navigate(`/lobby/${roomCode}`)
  }, [phase, roomCode, navigate])

  const confirmedCount = Object.values(players).filter((p) => p.hasSeenWord).length
  const totalCount = Object.keys(players).length
  const allConfirmed = confirmedCount >= totalCount

  async function handleConfirm() {
    setConfirmed(true)
    play('click')
    await confirmSeenWord(roomCode, playerId)
  }

  async function handleHostSkip() {
    play('roundStart')
    await startDiscussion(roomCode, settings.discussionTime)
  }

  if (!myWordAssignment) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="text-game-muted animate-pulse">Loading your word...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 animate-fade-in">
          <div className="text-game-muted text-sm mb-1 uppercase tracking-widest">
            Round {game?.currentRound || 1}
          </div>
          <h1 className="text-3xl font-black text-game-text">Your Word</h1>
        </div>

        {/* Word card */}
        {!revealed ? (
          <Card
            className="mb-6 text-center cursor-pointer select-none animate-slide-up"
            onClick={() => {
              setRevealed(true)
              play('reveal')
            }}
          >
            <div className="py-12">
              <div className="text-6xl mb-4">👁️</div>
              <p className="text-game-muted text-lg">Tap to reveal your word</p>
              <p className="text-game-muted text-xs mt-2">Make sure nobody else can see!</p>
            </div>
          </Card>
        ) : (
          <Card
            className={`mb-6 text-center animate-reveal ${myWordAssignment.isImpostor ? 'border-game-danger' : 'border-game-success'}`}
            glow={!myWordAssignment.isImpostor}
          >
            <div className="py-8">
              {myWordAssignment.isImpostor ? (
                <div className="space-y-4">
                  <div className="text-5xl">🕵️</div>
                  <div className="text-2xl font-black text-game-danger animate-pulse">
                    YOU ARE THE IMPOSTOR
                  </div>
                  {myWordAssignment.impostorMode === IMPOSTOR_MODES.NONE && (
                    <p className="text-game-muted text-sm">
                      You have no information. Blend in and bluff!
                    </p>
                  )}
                  {myWordAssignment.impostorMode === IMPOSTOR_MODES.THEME && (
                    <div>
                      <p className="text-game-muted text-sm mb-2">Category hint:</p>
                      <div className="text-2xl font-bold text-game-warning">
                        {myWordAssignment.shownInfo}
                      </div>
                    </div>
                  )}
                  {myWordAssignment.impostorMode === IMPOSTOR_MODES.HINT && (
                    <div>
                      <p className="text-game-muted text-sm mb-2">Vague hint:</p>
                      <div className="text-xl font-bold text-game-warning italic">
                        "{myWordAssignment.shownInfo}"
                      </div>
                    </div>
                  )}
                  <p className="text-game-muted text-xs">
                    Try to figure out the word from others' clues!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-5xl">🎯</div>
                  <p className="text-game-muted text-sm uppercase tracking-widest">
                    {myWordAssignment.category}
                  </p>
                  <div className="text-4xl font-black text-game-text">
                    {myWordAssignment.word}
                  </div>
                  <p className="text-game-muted text-sm">
                    Give clues that only you would know!
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Progress */}
        <div className="text-center mb-4">
          <p className="text-game-muted text-sm">
            {confirmedCount}/{totalCount} players confirmed
          </p>
          <div className="flex gap-1 mt-2 justify-center">
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${i < confirmedCount ? 'bg-game-success' : 'bg-game-border'}`}
              />
            ))}
          </div>
        </div>

        {revealed && !confirmed && (
          <Button fullWidth size="lg" onClick={handleConfirm} className="mb-3">
            ✓ Got it, I'm ready
          </Button>
        )}

        {confirmed && !allConfirmed && (
          <Card className="text-center">
            <p className="text-game-success font-semibold">✓ Confirmed!</p>
            <p className="text-game-muted text-sm mt-1">
              Waiting for {totalCount - confirmedCount} more player{totalCount - confirmedCount !== 1 ? 's' : ''}...
            </p>
          </Card>
        )}

        {isHost && confirmed && !allConfirmed && (
          <Button
            fullWidth
            variant="ghost"
            size="sm"
            onClick={handleHostSkip}
            className="mt-3"
          >
            Skip — start discussion now
          </Button>
        )}
      </div>
    </div>
  )
}
