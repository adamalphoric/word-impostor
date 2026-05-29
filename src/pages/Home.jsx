import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom, joinRoom } from '../services/roomService'
import { useGame } from '../context/GameContext'
import { setPlayerName, setLastRoom, getLastRoom } from '../utils/helpers'
import { isFirebaseConfigured } from '../firebase'
import Button from '../components/Button'
import Card from '../components/Card'
import Logo from '../components/Logo'
import { useSound } from '../hooks/useSound'

export default function Home() {
  const navigate = useNavigate()
  const { connectToRoom, setPlayerNameState } = useGame()
  const { play } = useSound()

  const [tab, setTab] = useState('create')
  const [name, setName] = useState(sessionStorage.getItem('wordImpostor_playerName') || '')
  const [code, setCode] = useState(getLastRoom() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6 text-center">
        <Logo size="lg" />
        <Card className="mt-8 max-w-lg">
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-game-text mb-3">Firebase Setup Required</h2>
          <p className="text-game-muted mb-4">
            This game needs a Firebase project for real-time multiplayer. Follow these steps:
          </p>
          <ol className="text-left text-game-muted text-sm space-y-2 mb-4">
            <li>1. Create a free Firebase project at <span className="text-game-primary">console.firebase.google.com</span></li>
            <li>2. Enable <strong className="text-game-text">Realtime Database</strong> (in test mode)</li>
            <li>3. Copy <code className="bg-black/30 px-1 rounded">.env.example</code> to <code className="bg-black/30 px-1 rounded">.env</code></li>
            <li>4. Paste your Firebase config values into <code className="bg-black/30 px-1 rounded">.env</code></li>
            <li>5. Run <code className="bg-black/30 px-1 rounded">npm run dev</code> again</li>
          </ol>
          <p className="text-xs text-game-muted">See README.md for detailed instructions.</p>
        </Card>
      </div>
    )
  }

  async function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return setError('Enter your name first')
    setError('')
    setLoading(true)
    try {
      setPlayerName(trimmed)
      setPlayerNameState(trimmed)
      const { roomCode } = await createRoom(trimmed)
      setLastRoom(roomCode)
      connectToRoom(roomCode)
      play('join')
      navigate(`/lobby/${roomCode}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    const trimmed = name.trim()
    const upperCode = code.trim().toUpperCase()
    if (!trimmed) return setError('Enter your name first')
    if (!upperCode) return setError('Enter a room code')
    setError('')
    setLoading(true)
    try {
      setPlayerName(trimmed)
      setPlayerNameState(trimmed)
      await joinRoom(upperCode, trimmed)
      setLastRoom(upperCode)
      connectToRoom(upperCode)
      play('join')
      navigate(`/lobby/${upperCode}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center animate-fade-in">
          <Logo size="lg" />
        </div>

        <Card className="animate-slide-up">
          <div className="flex rounded-xl bg-black/30 p-1 mb-5">
            {['create', 'join'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all capitalize ${
                  tab === t ? 'bg-game-primary text-white' : 'text-game-muted hover:text-game-text'
                }`}
              >
                {t === 'create' ? 'Create Room' : 'Join Room'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-game-muted mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full bg-black/30 border border-game-border rounded-xl px-4 py-3 text-game-text placeholder-game-muted focus:outline-none focus:border-game-primary transition-colors"
              />
            </div>

            {tab === 'join' && (
              <div>
                <label className="block text-sm text-game-muted mb-1">Room code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="ABCD12"
                  maxLength={6}
                  className="w-full bg-black/30 border border-game-border rounded-xl px-4 py-3 text-game-text placeholder-game-muted focus:outline-none focus:border-game-primary transition-colors font-mono text-xl tracking-widest text-center uppercase"
                />
              </div>
            )}

            {error && (
              <p className="text-game-danger text-sm text-center animate-fade-in">{error}</p>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={tab === 'create' ? handleCreate : handleJoin}
              loading={loading}
              sound={null}
            >
              {tab === 'create' ? '🎮 Create Room' : '🚀 Join Room'}
            </Button>
          </div>
        </Card>

        <p className="text-center text-game-muted text-xs mt-6">
          3–12 players • No account needed
        </p>

        <button
          onClick={() => navigate('/settings')}
          className="mt-3 w-full text-game-muted text-sm hover:text-game-text transition-colors text-center"
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  )
}
