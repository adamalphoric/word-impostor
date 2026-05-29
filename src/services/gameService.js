import { ref, update, get, remove, set } from 'firebase/database'
import { getDb } from '../firebase'
import { PHASES, IMPOSTOR_MODES, TIE_BEHAVIORS } from '../utils/constants'
import { getWordFromCategories } from '../data/words'
import { getMostVoted, getVoteCounts, randomItem } from '../utils/helpers'

export async function startGame(roomCode) {
  const db = getDb()
  const snap = await get(ref(db, `rooms/${roomCode}`))
  const room = snap.val()
  if (!room) throw new Error('Room not found')

  const { settings, players } = room
  const playerIds = Object.keys(players)

  const wordEntry = getWordFromCategories(settings.selectedCategories || [])
  if (!wordEntry) throw new Error('No words found for selected categories')

  const impostorId = playerIds[Math.floor(Math.random() * playerIds.length)]

  const wordAssignments = {}
  playerIds.forEach((id) => {
    if (id === impostorId) {
      wordAssignments[id] = {
        isImpostor: true,
        impostorMode: settings.impostorMode,
        shownInfo:
          settings.impostorMode === IMPOSTOR_MODES.NONE
            ? null
            : settings.impostorMode === IMPOSTOR_MODES.THEME
            ? wordEntry.category
            : wordEntry.hint || 'No hint available',
        category: wordEntry.category,
      }
    } else {
      wordAssignments[id] = {
        isImpostor: false,
        word: wordEntry.word,
        category: wordEntry.category,
      }
    }
  })

  const playerUpdates = {}
  playerIds.forEach((id) => {
    playerUpdates[`rooms/${roomCode}/players/${id}/isReady`] = false
    playerUpdates[`rooms/${roomCode}/players/${id}/hasSeenWord`] = false
    playerUpdates[`rooms/${roomCode}/players/${id}/vote`] = null
  })

  await update(ref(db), {
    ...playerUpdates,
    [`rooms/${roomCode}/meta/phase`]: PHASES.WORD_REVEAL,
    [`rooms/${roomCode}/meta/currentRound`]: (room.meta.currentRound || 0) + 1,
    [`rooms/${roomCode}/game`]: {
      word: wordEntry.word,
      category: wordEntry.category,
      hint: wordEntry.hint || '',
      impostorId,
      impostorMode: settings.impostorMode,
      discussionEndTime: null,
      votingEndTime: null,
      votesRevealed: false,
    },
    [`rooms/${roomCode}/wordAssignments`]: wordAssignments,
    [`rooms/${roomCode}/votes`]: null,
    [`rooms/${roomCode}/continueVotes`]: null,
  })
}

export async function confirmSeenWord(roomCode, playerId) {
  const db = getDb()
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), { hasSeenWord: true })

  const snap = await get(ref(db, `rooms/${roomCode}`))
  const room = snap.val()
  if (!room) return

  const players = room.players || {}
  const allSeen = Object.values(players).every((p) => p.hasSeenWord)

  if (allSeen) {
    await startDiscussion(roomCode, room.settings.discussionTime)
  }
}

export async function startDiscussion(roomCode, discussionTime) {
  const db = getDb()
  const endTime = Date.now() + discussionTime * 1000
  await update(ref(db, `rooms/${roomCode}`), {
    'meta/phase': PHASES.DISCUSSION,
    'game/discussionEndTime': endTime,
  })
}

export async function startVoting(roomCode, votingTime) {
  const db = getDb()
  const endTime = votingTime > 0 ? Date.now() + votingTime * 1000 : null
  await update(ref(db, `rooms/${roomCode}`), {
    'meta/phase': PHASES.VOTING,
    'game/votingEndTime': endTime,
  })
}

export async function submitVote(roomCode, voterId, targetId) {
  const db = getDb()
  await set(ref(db, `rooms/${roomCode}/votes/${voterId}`), targetId)

  const snap = await get(ref(db, `rooms/${roomCode}`))
  const room = snap.val()
  if (!room) return

  const players = room.players || {}
  const votes = room.votes || {}
  const totalVoters = Object.keys(players).length

  if (Object.keys(votes).length >= totalVoters) {
    await revealVotes(roomCode)
  }
}

export async function revealVotes(roomCode) {
  const db = getDb()
  await update(ref(db, `rooms/${roomCode}`), {
    'meta/phase': PHASES.VOTE_REVEAL,
    'game/votesRevealed': true,
  })
}

export async function processResults(roomCode) {
  const db = getDb()
  const snap = await get(ref(db, `rooms/${roomCode}`))
  const room = snap.val()
  if (!room) return

  const { game, players, votes, settings, meta } = room
  const voteCounts = getVoteCounts(votes, players)
  const { winners, count } = getMostVoted(voteCounts)

  let eliminated = null
  let isTie = winners.length > 1 && count > 0

  if (!isTie && winners.length === 1 && count > 0) {
    eliminated = winners[0]
  } else if (isTie && settings.tieBehavior === TIE_BEHAVIORS.RANDOM) {
    eliminated = randomItem(winners)
    isTie = false
  }

  const impostorCaught = eliminated === game.impostorId
  const scoreUpdates = {}

  if (impostorCaught) {
    Object.keys(players).forEach((id) => {
      if (id !== game.impostorId) {
        scoreUpdates[`rooms/${roomCode}/players/${id}/score`] = (players[id].score || 0) + 1
      }
    })
  } else {
    scoreUpdates[`rooms/${roomCode}/players/${game.impostorId}/score`] =
      (players[game.impostorId]?.score || 0) + 2
  }

  const isLastRound = !settings.endlessMode && meta.currentRound >= settings.maxRounds

  await update(ref(db), {
    ...scoreUpdates,
    [`rooms/${roomCode}/meta/phase`]: PHASES.RESULTS,
    [`rooms/${roomCode}/game/eliminated`]: eliminated,
    [`rooms/${roomCode}/game/impostorCaught`]: impostorCaught,
    [`rooms/${roomCode}/game/isTie`]: isTie,
    [`rooms/${roomCode}/game/isLastRound`]: isLastRound,
  })

  if (isTie && settings.tieBehavior === TIE_BEHAVIORS.REVOTE) {
    // Host must manually trigger next action
  }
}

export async function voteToPlay(roomCode, playerId, continueGame) {
  const db = getDb()
  await set(ref(db, `rooms/${roomCode}/continueVotes/${playerId}`), continueGame)

  const snap = await get(ref(db, `rooms/${roomCode}`))
  const room = snap.val()
  if (!room) return

  const players = room.players || {}
  const continueVotes = room.continueVotes || {}
  const totalPlayers = Object.keys(players).length
  const totalVotes = Object.keys(continueVotes).length

  if (totalVotes >= totalPlayers) {
    const continueCount = Object.values(continueVotes).filter(Boolean).length
    if (continueCount > totalPlayers / 2) {
      await startGame(roomCode)
    } else {
      await update(ref(db, `rooms/${roomCode}/meta`), { phase: PHASES.FINAL_RESULTS })
    }
  }
}

export async function hostForcePhase(roomCode, phase, extra = {}) {
  const db = getDb()
  const updates = { [`rooms/${roomCode}/meta/phase`]: phase, ...extra }
  await update(ref(db), updates)
}

export async function resetToLobby(roomCode) {
  const db = getDb()
  const snap = await get(ref(db, `rooms/${roomCode}/players`))
  const players = snap.val() || {}

  const playerUpdates = {}
  Object.keys(players).forEach((id) => {
    playerUpdates[`rooms/${roomCode}/players/${id}/isReady`] = false
    playerUpdates[`rooms/${roomCode}/players/${id}/hasSeenWord`] = false
  })

  await update(ref(db), {
    ...playerUpdates,
    [`rooms/${roomCode}/meta/phase`]: PHASES.LOBBY,
    [`rooms/${roomCode}/meta/currentRound`]: 0,
    [`rooms/${roomCode}/game`]: null,
    [`rooms/${roomCode}/votes`]: null,
    [`rooms/${roomCode}/continueVotes`]: null,
    [`rooms/${roomCode}/wordAssignments`]: null,
  })
}
