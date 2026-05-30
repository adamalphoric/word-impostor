import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { setReady, kickPlayer, updateSettings, leaveRoom, joinRoom } from '../services/roomService'
import { startGame } from '../services/gameService'
import { getShareUrl, copyToClipboard, getPlayerName, setPlayerName as saveName } from '../utils/helpers'
import { PHASES, DEFAULT_SETTINGS, MIN_PLAYERS } from '../utils/constants'
import { WORD_PACKS } from '../data/words'
import Button from '../components/Button'
import Card from '../components/Card'
import Logo from '../components/Logo'
import PlayerList from '../components/PlayerList'
import Modal from '../components/Modal'
import { useSound } from '../hooks/useSound'

export default function Lobby() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { room, playerId, isHost, phase, players, settings, connectToRoom, me } = useGame()
  const { play } = useSound()
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [reconnecting, setReconnecting] = useState(!room)

  useEffect(() => {
    if (!room) {
      const name = getPlayerName()
      if (!name || !roomCode) {
        navigate('/')
        return
      }
      setReconnecting(true)
      joinRoom(roomCode, name)
        .then(() => {
          connectToRoom(roomCode)
          setReconnecting(false)
        })
        .catch(() => navigate('/'))
    } else {
      setReconnecting(false)
    }
  }, [room, roomCode, navigate, connectToRoom])

  useEffect(() => {
    if (!phase) return
    if (phase === PHASES.WORD_REVEAL) navigate(`/reveal/${roomCode}`)
    else if (phase !== PHASES.LOBBY) navigate(`/game/${roomCode}`)
  }, [phase, roomCode, navigate])

  if (reconnecting || !room) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="text-game-muted animate-pulse text-lg">Connecting...</div>
      </div>
    )
  }

  const playerCount = Object.keys(players).length
  const readyCount = Object.values(players).filter((p) => p.isReady).length
  const allReady = readyCount === playerCount && playerCount >= MIN_PLAYERS
  const shareUrl = getShareUrl(roomCode)

  async function handleReady() {
    await setReady(roomCode, playerId, !me?.isReady)
    play('click')
  }

  async function handleStart() {
    if (playerCount < MIN_PLAYERS) {
      setError(`Need at least ${MIN_PLAYERS} players to start`)
      return
    }
    setError('')
    setStarting(true)
    try {
      await startGame(roomCode)
      play('roundStart')
    } catch (e) {
      setError(e.message)
      setStarting(false)
    }
  }

  async function handleCopy() {
    await copyToClipboard(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopyCode() {
    await copyToClipboard(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleKick(id) {
    if (window.confirm(`Kick this player?`)) {
      await kickPlayer(roomCode, id)
    }
  }

  async function handleLeave() {
    if (window.confirm('Leave the room?')) {
      await leaveRoom(roomCode, playerId)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-game-bg p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <button onClick={handleLeave} className="text-game-muted hover:text-game-danger text-sm transition-colors">
            Leave
          </button>
        </div>

        {/* Room code */}
        <Card className="mb-4 text-center">
          <p className="text-game-muted text-sm mb-1">Room Code</p>
          <button
            onClick={handleCopyCode}
            className="text-5xl font-black tracking-widest text-game-primary font-mono hover:text-game-secondary transition-colors"
          >
            {roomCode}
          </button>
          <div className="flex gap-2 mt-3 justify-center">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </Button>
          </div>
          <p className="text-xs text-game-muted mt-2">Share this code with friends</p>
        </Card>

        {/* Players */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-game-text">
              Players ({playerCount}/12)
            </h3>
            <span className="text-sm text-game-muted">
              {readyCount}/{playerCount} ready
            </span>
          </div>
          <PlayerList
            players={players}
            currentPlayerId={playerId}
            hostId={room.meta?.hostId}
            showReady
            showKick={isHost}
            onKick={handleKick}
          />
          {playerCount < MIN_PLAYERS && (
            <p className="text-game-muted text-sm mt-3 text-center">
              Need {MIN_PLAYERS - playerCount} more player{MIN_PLAYERS - playerCount !== 1 ? 's' : ''} to start
            </p>
          )}
        </Card>

        {/* Settings summary */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-game-text">Settings</h3>
            {isHost && (
              <button
                onClick={() => setShowSettings(true)}
                className="text-game-primary text-sm hover:text-game-secondary transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-game-muted">
            <div>⏱ Discussion: {settings.discussionTime}s</div>
            <div>🗳 Voting: {settings.votingTime > 0 ? `${settings.votingTime}s` : 'Unlimited'}</div>
            <div>🔄 Rounds: {settings.endlessMode ? 'Endless' : settings.maxRounds}</div>
            <div>🕵️ Mode: {settings.impostorMode === 'none' ? 'No info' : settings.impostorMode === 'theme' ? 'Theme only' : 'Vague hint'}</div>
          </div>
        </Card>

        {error && <p className="text-game-danger text-sm text-center mb-3">{error}</p>}

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <Button
              fullWidth
              size="xl"
              onClick={handleStart}
              loading={starting}
              disabled={playerCount < MIN_PLAYERS}
              sound="roundStart"
            >
              {allReady ? '🚀 Start Game!' : `Start Game (${readyCount}/${playerCount} ready)`}
            </Button>
          ) : (
            <Button
              fullWidth
              size="xl"
              variant={me?.isReady ? 'success' : 'primary'}
              onClick={handleReady}
              sound="click"
            >
              {me?.isReady ? '✓ Ready! (tap to unready)' : '👍 Ready Up'}
            </Button>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        roomCode={roomCode}
        settings={settings}
      />
    </div>
  )
}

const DISCUSSION_PRESETS = [30, 60, 90, 120, 180]
const VOTING_PRESETS = [0, 30, 60, 90, 120]
const ROUND_PRESETS = [1, 3, 5, 7, 10]

function SettingsModal({ isOpen, onClose, roomCode, settings }) {
  const [local, setLocal] = useState(settings)
  const [customDiscussion, setCustomDiscussion] = useState(!DISCUSSION_PRESETS.includes(settings.discussionTime))
  const [customVoting, setCustomVoting] = useState(!VOTING_PRESETS.includes(settings.votingTime))
  const [customRounds, setCustomRounds] = useState(!ROUND_PRESETS.includes(settings.maxRounds) && !settings.endlessMode)

  useEffect(() => {
    setLocal(settings)
    setCustomDiscussion(!DISCUSSION_PRESETS.includes(settings.discussionTime))
    setCustomVoting(!VOTING_PRESETS.includes(settings.votingTime))
    setCustomRounds(!ROUND_PRESETS.includes(settings.maxRounds) && !settings.endlessMode)
  }, [settings])

  function toggle(key) {
    const next = { ...local, [key]: !local[key] }
    setLocal(next)
    updateSettings(roomCode, next)
  }

  function setNum(key, val) {
    const next = { ...local, [key]: val }
    setLocal(next)
    updateSettings(roomCode, next)
  }

  function toggleCategory(catId) {
    const current = local.selectedCategories || []
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId]
    if (next.length === 0) return
    const updated = { ...local, selectedCategories: next }
    setLocal(updated)
    updateSettings(roomCode, updated)
  }

  const customInputClass = "w-full bg-black/40 border border-game-border rounded-lg px-3 py-2 text-game-text mt-2"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Game Settings">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm text-game-muted mb-1">Discussion time</label>
          <select
            value={customDiscussion ? 'custom' : local.discussionTime}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setCustomDiscussion(true)
              } else {
                setCustomDiscussion(false)
                setNum('discussionTime', Number(e.target.value))
              }
            }}
            className="w-full bg-black/40 border border-game-border rounded-lg px-3 py-2 text-game-text"
          >
            {DISCUSSION_PRESETS.map((s) => (
              <option key={s} value={s}>{s} seconds</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {customDiscussion && (
            <input
              type="number"
              min={10}
              max={600}
              value={local.discussionTime}
              onChange={(e) => { if (Number(e.target.value) >= 10) setNum('discussionTime', Number(e.target.value)) }}
              className={customInputClass}
              placeholder="Seconds (10–600)"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-game-muted mb-1">Voting time</label>
          <select
            value={customVoting ? 'custom' : local.votingTime}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setCustomVoting(true)
              } else {
                setCustomVoting(false)
                setNum('votingTime', Number(e.target.value))
              }
            }}
            className="w-full bg-black/40 border border-game-border rounded-lg px-3 py-2 text-game-text"
          >
            <option value={0}>Unlimited</option>
            {[30, 60, 90, 120].map((s) => (
              <option key={s} value={s}>{s} seconds</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
          {customVoting && (
            <input
              type="number"
              min={10}
              max={600}
              value={local.votingTime}
              onChange={(e) => { if (Number(e.target.value) >= 10) setNum('votingTime', Number(e.target.value)) }}
              className={customInputClass}
              placeholder="Seconds (10–600)"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-game-muted mb-1">Number of rounds</label>
          <div className="flex gap-2 flex-wrap">
            {ROUND_PRESETS.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setCustomRounds(false)
                  const next = { ...local, maxRounds: n, endlessMode: false }
                  setLocal(next)
                  updateSettings(roomCode, next)
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  local.maxRounds === n && !local.endlessMode && !customRounds
                    ? 'bg-game-primary text-white'
                    : 'bg-black/30 text-game-muted hover:text-game-text'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => {
                setCustomRounds(false)
                const next = { ...local, endlessMode: !local.endlessMode }
                setLocal(next)
                updateSettings(roomCode, next)
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                local.endlessMode ? 'bg-game-primary text-white' : 'bg-black/30 text-game-muted hover:text-game-text'
              }`}
            >
              ∞
            </button>
            <button
              onClick={() => {
                setCustomRounds(true)
                const next = { ...local, endlessMode: false }
                setLocal(next)
                updateSettings(roomCode, next)
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                customRounds ? 'bg-game-primary text-white' : 'bg-black/30 text-game-muted hover:text-game-text'
              }`}
            >
              Custom
            </button>
          </div>
          {customRounds && (
            <input
              type="number"
              min={1}
              max={100}
              value={local.maxRounds}
              onChange={(e) => { if (Number(e.target.value) >= 1) setNum('maxRounds', Number(e.target.value)) }}
              className={customInputClass}
              placeholder="Rounds (1–100)"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-game-muted mb-2">Impostor gets...</label>
          <div className="space-y-2">
            {[
              { val: 'none', label: 'No information', desc: 'Fly blind' },
              { val: 'theme', label: 'Category only', desc: 'e.g. Animals' },
              { val: 'hint', label: 'Vague hint', desc: 'e.g. "Large"' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setNum('impostorMode', opt.val)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                  local.impostorMode === opt.val
                    ? 'border-game-primary bg-game-primary/10'
                    : 'border-game-border bg-black/20 hover:border-game-muted'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-game-text text-sm">{opt.label}</div>
                  <div className="text-xs text-game-muted">{opt.desc}</div>
                </div>
                {local.impostorMode === opt.val && <span className="text-game-primary">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-game-muted mb-2">Word categories</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(WORD_PACKS).map(([id, pack]) => {
              const active = (local.selectedCategories || []).includes(id)
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    active ? 'bg-game-primary/20 border border-game-primary text-game-primary' : 'bg-black/20 border border-game-border text-game-muted hover:text-game-text'
                  }`}
                >
                  <span>{pack.emoji}</span>
                  <span className="truncate">{pack.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'anonymousVoting', label: 'Anonymous voting' },
            { key: 'autoNextRound', label: 'Auto-start next round' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-game-text">{label}</span>
              <button
                onClick={() => toggle(key)}
                className={`w-12 h-6 rounded-full transition-colors relative ${local[key] ? 'bg-game-primary' : 'bg-game-border'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${local[key] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <Button fullWidth onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}
