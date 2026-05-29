import { useCallback } from 'react'
import { sounds, resumeAudio } from '../utils/audio'
import { useLocalStorage } from './useLocalStorage'

export function useSound() {
  const [soundEnabled] = useLocalStorage('wordImpostor_soundEnabled', true)

  const play = useCallback(
    (soundName) => {
      if (!soundEnabled) return
      resumeAudio()
      const fn = sounds[soundName]
      if (fn) fn()
    },
    [soundEnabled]
  )

  return { play, soundEnabled }
}
