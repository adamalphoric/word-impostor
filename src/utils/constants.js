export const PHASES = {
  LOBBY: 'lobby',
  WORD_REVEAL: 'word-reveal',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  VOTE_REVEAL: 'vote-reveal',
  RESULTS: 'results',
  FINAL_RESULTS: 'final-results',
}

export const IMPOSTOR_MODES = {
  NONE: 'none',
  THEME: 'theme',
  HINT: 'hint',
}

export const TIE_BEHAVIORS = {
  REVOTE: 'revote',
  RANDOM: 'random',
  NO_ELIMINATION: 'no_elimination',
}

export const DEFAULT_SETTINGS = {
  discussionTime: 90,
  votingTime: 60,
  maxRounds: 3,
  endlessMode: false,
  impostorMode: IMPOSTOR_MODES.THEME,
  tieBehavior: TIE_BEHAVIORS.REVOTE,
  anonymousVoting: true,
  selectedCategories: ['animals', 'sports', 'movies', 'jobs'],
  allowSpectators: false,
  autoNextRound: false,
  minPlayers: 3,
  soundEnabled: true,
  animationsEnabled: true,
  darkMode: true,
  largerText: false,
}

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 12
export const ROOM_CODE_LENGTH = 2
export const PLAYER_INACTIVITY_TIMEOUT = 30000
export const ROOM_EXPIRY_HOURS = 4
