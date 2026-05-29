import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_SETTINGS } from '../utils/constants'
import Button from '../components/Button'
import Card from '../components/Card'

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-game-border last:border-0">
      <div className="flex-1 mr-4">
        <div className="text-game-text font-medium text-sm">{label}</div>
        {description && <div className="text-game-muted text-xs mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-game-primary' : 'bg-game-border'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const [soundEnabled, setSoundEnabled] = useLocalStorage('wordImpostor_soundEnabled', true)
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage('wordImpostor_animationsEnabled', true)
  const [largerText, setLargerText] = useLocalStorage('wordImpostor_largerText', false)

  function handleBack() {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-game-bg p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="text-game-muted hover:text-game-text transition-colors text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-black text-game-text">Settings</h1>
        </div>

        {/* UI Settings */}
        <Card className="mb-4">
          <h2 className="font-bold text-game-muted uppercase text-xs tracking-widest mb-3">Interface</h2>
          <Toggle
            value={soundEnabled}
            onChange={setSoundEnabled}
            label="Sound Effects"
            description="Tones for votes, timers, and reveals"
          />
          <Toggle
            value={animationsEnabled}
            onChange={setAnimationsEnabled}
            label="Animations"
            description="Transitions and reveal effects"
          />
          <Toggle
            value={largerText}
            onChange={setLargerText}
            label="Larger Text"
            description="Increase font size for easier reading"
          />
        </Card>

        {/* Game settings info */}
        <Card className="mb-4">
          <h2 className="font-bold text-game-muted uppercase text-xs tracking-widest mb-3">Game Settings</h2>
          <p className="text-game-muted text-sm">
            Game settings (rounds, timer, impostor mode) are configured in the lobby by the host. They apply per game session.
          </p>
        </Card>

        {/* How to Play */}
        <Card className="mb-4">
          <h2 className="font-bold text-game-muted uppercase text-xs tracking-widest mb-4">How to Play</h2>
          <div className="space-y-4 text-sm text-game-muted">
            <div className="flex gap-3">
              <span className="text-xl">1️⃣</span>
              <div>
                <div className="font-semibold text-game-text">Create or Join</div>
                <div>One player creates a room and shares the code with friends.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">2️⃣</span>
              <div>
                <div className="font-semibold text-game-text">Get Your Word</div>
                <div>Each player privately sees a secret word — except the Impostor, who gets limited info.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">3️⃣</span>
              <div>
                <div className="font-semibold text-game-text">Give Clues</div>
                <div>Take turns saying ONE word clue out loud. The Impostor must fake it!</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">4️⃣</span>
              <div>
                <div className="font-semibold text-game-text">Vote</div>
                <div>Vote on who you think the Impostor is. Most votes gets eliminated.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">5️⃣</span>
              <div>
                <div className="font-semibold text-game-text">Win</div>
                <div>Town wins if they catch the Impostor. Impostor wins if they survive!</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Scoring */}
        <Card className="mb-4">
          <h2 className="font-bold text-game-muted uppercase text-xs tracking-widest mb-3">Scoring</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-game-muted">Impostor caught</span>
              <span className="text-game-success font-bold">+1 per town player</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-game-muted">Impostor survives</span>
              <span className="text-game-danger font-bold">+2 for Impostor</span>
            </div>
          </div>
        </Card>

        <Button variant="ghost" fullWidth onClick={handleBack}>
          ← Back
        </Button>

        <p className="text-center text-game-muted text-xs mt-4">
          Word Impostor — A social deduction party game
        </p>
      </div>
    </div>
  )
}
