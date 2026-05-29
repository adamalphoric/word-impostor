import { HashRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { GameProvider } from './context/GameContext'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import WordReveal from './pages/WordReveal'
import Discussion from './pages/Discussion'
import Voting from './pages/Voting'
import VoteReveal from './pages/VoteReveal'
import Results from './pages/Results'
import FinalResults from './pages/FinalResults'
import Settings from './pages/Settings'

function JoinRedirect() {
  const { roomCode } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/lobby/${roomCode}`, { replace: true })
  }, [roomCode, navigate])

  return null
}

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <div className="min-h-screen bg-game-bg font-game text-game-text">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/join/:roomCode" element={<JoinRedirect />} />
            <Route path="/lobby/:roomCode" element={<Lobby />} />
            <Route path="/reveal/:roomCode" element={<WordReveal />} />
            <Route path="/game/:roomCode" element={<Discussion />} />
            <Route path="/vote/:roomCode" element={<Voting />} />
            <Route path="/vote-reveal/:roomCode" element={<VoteReveal />} />
            <Route path="/results/:roomCode" element={<Results />} />
            <Route path="/final/:roomCode" element={<FinalResults />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </GameProvider>
  )
}
