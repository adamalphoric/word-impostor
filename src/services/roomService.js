import { ref, set, get, update, onValue, off, push, serverTimestamp, remove, onDisconnect } from 'firebase/database'
import { getDb } from '../firebase'
import { generateRoomCode, getOrCreatePlayerId } from '../utils/helpers'
import { PHASES, DEFAULT_SETTINGS } from '../utils/constants'

export async function createRoom(playerName, settings = {}) {
  const db = getDb()
  const roomCode = generateRoomCode()
  const playerId = getOrCreatePlayerId()

  const roomRef = ref(db, `rooms/${roomCode}`)
  const existing = await get(roomRef)
  if (existing.exists()) {
    return createRoom(playerName, settings)
  }

  const roomData = {
    meta: {
      hostId: playerId,
      phase: PHASES.LOBBY,
      currentRound: 0,
      createdAt: Date.now(),
    },
    settings: { ...DEFAULT_SETTINGS, ...settings },
    players: {
      [playerId]: {
        name: playerName,
        isHost: true,
        isReady: false,
        score: 0,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
        hasSeenWord: false,
      },
    },
  }

  await set(roomRef, roomData)

  const presenceRef = ref(db, `rooms/${roomCode}/players/${playerId}/lastSeen`)
  onDisconnect(presenceRef).set(Date.now())

  return { roomCode, playerId }
}

export async function joinRoom(roomCode, playerName) {
  const db = getDb()
  const playerId = getOrCreatePlayerId()
  const upper = roomCode.toUpperCase()

  const roomRef = ref(db, `rooms/${upper}`)
  const snap = await get(roomRef)

  if (!snap.exists()) {
    throw new Error('Room not found. Check the code and try again.')
  }

  const room = snap.val()

  if (room.meta.phase !== PHASES.LOBBY) {
    const existingPlayer = room.players?.[playerId]
    if (!existingPlayer) {
      throw new Error('Game already in progress. Ask the host to restart.')
    }
  }

  const players = room.players || {}
  const names = Object.values(players).map((p) => p.name.toLowerCase())
  if (names.includes(playerName.toLowerCase()) && !players[playerId]) {
    throw new Error('That name is already taken. Choose a different name.')
  }

  const playerCount = Object.keys(players).length
  if (playerCount >= 12 && !players[playerId]) {
    throw new Error('Room is full (max 12 players).')
  }

  const playerRef = ref(db, `rooms/${upper}/players/${playerId}`)
  await set(playerRef, {
    name: playerName,
    isHost: room.meta.hostId === playerId,
    isReady: false,
    score: players[playerId]?.score || 0,
    joinedAt: players[playerId]?.joinedAt || Date.now(),
    lastSeen: Date.now(),
    hasSeenWord: false,
  })

  onDisconnect(ref(db, `rooms/${upper}/players/${playerId}/lastSeen`)).set(Date.now())

  return { roomCode: upper, playerId }
}

export function subscribeToRoom(roomCode, callback) {
  const db = getDb()
  const roomRef = ref(db, `rooms/${roomCode}`)
  onValue(roomRef, (snap) => callback(snap.val()))
  return () => off(roomRef)
}

export async function setReady(roomCode, playerId, ready) {
  const db = getDb()
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { isReady: ready })
}

export async function kickPlayer(roomCode, playerId) {
  const db = getDb()
  await remove(ref(db, `rooms/${roomCode}/players/${playerId}`))
}

export async function transferHost(roomCode, newHostId) {
  const db = getDb()
  const snap = await get(ref(db, `rooms/${roomCode}/players`))
  const players = snap.val() || {}
  const updates = {}

  Object.keys(players).forEach((id) => {
    updates[`rooms/${roomCode}/players/${id}/isHost`] = id === newHostId
  })
  updates[`rooms/${roomCode}/meta/hostId`] = newHostId
  await update(ref(db), updates)
}

export async function updateSettings(roomCode, settings) {
  const db = getDb()
  await update(ref(db, `rooms/${roomCode}/settings`), settings)
}

export async function updatePresence(roomCode, playerId) {
  const db = getDb()
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { lastSeen: Date.now() })
}

export async function leaveRoom(roomCode, playerId) {
  const db = getDb()
  const snap = await get(ref(db, `rooms/${roomCode}`))
  if (!snap.exists()) return

  const room = snap.val()
  const players = room.players || {}
  const remaining = Object.keys(players).filter((id) => id !== playerId)

  if (remaining.length === 0) {
    await remove(ref(db, `rooms/${roomCode}`))
    return
  }

  await remove(ref(db, `rooms/${roomCode}/players/${playerId}`))

  if (room.meta.hostId === playerId && remaining.length > 0) {
    await transferHost(roomCode, remaining[0])
  }
}
