import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { submitVote, revealVotes } from '../services/gameService'
import { PHASES } from '../utils/constants'
import { getVoteCounts, getPlayerInitials, getAvatarColor } from '../utils/helpers'
import Button from '../components/Button'
import Card from '../components/Card'
import Timer from '../components/Timer'
import { useSound } from '../hooks/useSound'

export default function Voting() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { playerId, players, votes, phase, settings, game, isHost } = useGame()
  const { play } = useSound()
  const [myVote, setMyVote] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (phase === PHASES.VOTE_REVEAL) navigate(`/vote-reveal/${roomCode}`)
    else if (phase === PHASES.RESULTS) navigate(`/results/${roomCode}`)
    else if (phase === PHASES.LOBBY) navigate(`/lobby/${roomCode}`)
    else if (phase === PHASES.DISCUSSION) navigate(`/game/${roomCode}`)
  }, [phase, roomCode, navigate])

  useEffect(() => {
    if (votes?.[playerId]) setMyVote(votes[playerId])
  }, [votes, playerId])

  const voteCounts = getVoteCounts(votes, players)
  const totalVoters = Object.keys(players).length
  const votesCast = Object.keys(votes || {}).length
  const allVoted = votesCast >= totalVoters
  const iVoted = !!votes?.[playerId]

  async function handleVote(targetId) {
    if (submitting || iVoted || targetId === playerId) return
    setSubmitting(true)
    play('vote')
    try {
      setMyVote(targetId)
      await submitVote(roomCode, playerId, targetId)
    } catch (e) {
      setMyVote(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTimerEnd() {
    if (!isHost) return
    await revealVotes(roomCode)
  }

  async function handleHostReveal() {
    play('reveal')
    await revealVotes(roomCode)
  }

  const playerList = Object.entries(players)

  return (
    <div className="min-h-screen bg-game-bg flex flex-col p-4 md:p-6">
      <div className="max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="text-game-muted text-xs uppercase tracking-widest mb-1">
            Round {game?.currentRound || 1}
          </div>
          <h1 className="text-3xl font-black text-game-text">Vote!</h1>
          <p className="text-game-muted text-sm mt-1">Who do you think is the impostor?</p>
        </div>

        {/* Timer */}
        {game?.votingEndTime && (
          <Card className="mb-4 text-center">
            <Timer
              endTime={game.votingEndTime}
              onExpire={handleTimerEnd}
              warningSeconds={10}
            />
          </Card>
        )}

        {/* Vote progress */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-game-muted text-sm">{votesCast}/{totalVoters} votes cast</span>
          {!settings.anonymousVoting && iVoted && (
            <span className="text-game-muted text-xs">You voted for {players[myVote]?.name}</span>
          )}
        </div>

        {/* Voting grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {playerList.map(([id, player]) => {
            const isMe = id === playerId
            const isMyTarget = myVote === id
            const count = settings.anonymousVoting ? null : voteCounts[id]

            return (
              <button
                key={id}
                onClick={() => handleVote(id)}
                disabled={isMe || iVoted || submitting}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all
                  ${isMe ? 'opacity-40 cursor-not-allowed border-game-border bg-game-card' : ''}
                  ${isMyTarget ? 'border-game-danger bg-game-danger/20 scale-105' : ''}
                  ${!isMe && !isMyTarget && !iVoted ? 'border-game-border bg-game-card hover:border-game-primary hover:bg-game-primary/10 cursor-pointer active:scale-95' : ''}
                  ${!isMe && !isMyTarget && iVoted ? 'border-game-border bg-game-card opacity-60' : ''}
                `}
              >
                {isMyTarget && (
                  <div className="absolute -top-2 -right-2 bg-game-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Your vote
                  </div>
                )}
                <div className={`${getAvatarColor(player.name)} w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg`}>
                  {getPlayerInitials(player.name)}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-game-text text-sm">{player.name}</div>
                  {isMe && <div className="text-xs text-game-muted">(you)</div>}
                  {count !== null && count > 0 && (
                    <div className="text-xs text-game-danger mt-0.5">{count} vote{count !== 1 ? 's' : ''}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {iVoted && !allVoted && (
          <Card className="text-center mb-4">
            <p className="text-game-success font-semibold">✓ Vote submitted!</p>
            <p className="text-game-muted text-sm mt-1">
              Waiting for {totalVoters - votesCast} more...
            </p>
          </Card>
        )}

        {isHost && (
          <Button
            variant="ghost"
            fullWidth
            onClick={handleHostReveal}
          >
            Reveal Votes Now →
          </Button>
        )}
      </div>
    </div>
  )
}
