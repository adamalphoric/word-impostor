import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { subscribeToRoom, updatePresence } from '../services/roomService'
import { getOrCreatePlayerId, getPlayerName } from '../utils/helpers'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null)
  const [roomCode, setRoomCode] = useState(null)
  const [playerId] = useState(getOrCreatePlayerId)
  const [playerName, setPlayerNameState] = useState(getPlayerName)
  const unsubRef = useRef(null)
  const presenceRef = useRef(null)

  const connectToRoom = useCallback((code) => {
    if (unsubRef.current) unsubRef.current()
    setRoomCode(code)

    unsubRef.current = subscribeToRoom(code, (data) => {
      setRoom(data)
    })

    presenceRef.current = setInterval(() => {
      updatePresence(code, playerId).catch(() => {})
    }, 10000)

    return () => {
      if (unsubRef.current) unsubRef.current()
      if (presenceRef.current) clearInterval(presenceRef.current)
    }
  }, [playerId])

  const disconnectFromRoom = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current()
      unsubRef.current = null
    }
    if (presenceRef.current) {
      clearInterval(presenceRef.current)
      presenceRef.current = null
    }
    setRoom(null)
    setRoomCode(null)
  }, [])

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current()
      if (presenceRef.current) clearInterval(presenceRef.current)
    }
  }, [])

  const me = room?.players?.[playerId]
  const isHost = me?.isHost || false
  const phase = room?.meta?.phase
  const players = room?.players || {}
  const settings = room?.settings || {}
  const game = room?.game || {}
  const votes = room?.votes || {}
  const continueVotes = room?.continueVotes || {}
  const myWordAssignment = room?.wordAssignments?.[playerId]

  return (
    <GameContext.Provider
      value={{
        room,
        roomCode,
        playerId,
        playerName,
        setPlayerNameState,
        me,
        isHost,
        phase,
        players,
        settings,
        game,
        votes,
        continueVotes,
        myWordAssignment,
        connectToRoom,
        disconnectFromRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
