import { ROOM_CODE_LENGTH } from './constants'

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generatePlayerId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function getOrCreatePlayerId() {
  let id = sessionStorage.getItem('wordImpostor_playerId')
  if (!id) {
    id = generatePlayerId()
    sessionStorage.setItem('wordImpostor_playerId', id)
  }
  return id
}

export function getPlayerName() {
  return sessionStorage.getItem('wordImpostor_playerName') || ''
}

export function setPlayerName(name) {
  sessionStorage.setItem('wordImpostor_playerName', name)
}

export function getLastRoom() {
  return sessionStorage.getItem('wordImpostor_lastRoom') || ''
}

export function setLastRoom(code) {
  sessionStorage.setItem('wordImpostor_lastRoom', code)
}

export function formatTime(seconds) {
  if (seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getVoteCounts(votes, players) {
  const counts = {}
  Object.keys(players || {}).forEach((id) => {
    counts[id] = 0
  })
  Object.values(votes || {}).forEach((targetId) => {
    if (counts[targetId] !== undefined) counts[targetId]++
  })
  return counts
}

export function getMostVoted(voteCounts) {
  const entries = Object.entries(voteCounts)
  if (!entries.length) return { winners: [], count: 0 }
  const max = Math.max(...entries.map(([, c]) => c))
  const winners = entries.filter(([, c]) => c === max).map(([id]) => id)
  return { winners, count: max }
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getShareUrl(roomCode) {
  const base = window.location.origin + window.location.pathname
  return `${base}#/join/${roomCode}`
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  return Promise.resolve()
}

export function getPlayerInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
]

export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
