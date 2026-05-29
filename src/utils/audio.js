let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function playTone(frequency, duration, type = 'sine', gain = 0.3, startTime = 0) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gainNode = c.createGain()
    osc.connect(gainNode)
    gainNode.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, c.currentTime + startTime)
    gainNode.gain.setValueAtTime(0, c.currentTime + startTime)
    gainNode.gain.linearRampToValueAtTime(gain, c.currentTime + startTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startTime + duration)
    osc.start(c.currentTime + startTime)
    osc.stop(c.currentTime + startTime + duration)
  } catch {
    // Audio not supported
  }
}

export const sounds = {
  click: () => playTone(800, 0.08, 'sine', 0.2),

  vote: () => {
    playTone(523, 0.1, 'sine', 0.25)
    playTone(659, 0.15, 'sine', 0.2, 0.1)
  },

  roundStart: () => {
    playTone(440, 0.1, 'square', 0.15)
    playTone(554, 0.1, 'square', 0.15, 0.12)
    playTone(659, 0.2, 'square', 0.15, 0.24)
  },

  timerTick: () => playTone(880, 0.05, 'sine', 0.1),

  timerWarning: () => playTone(440, 0.1, 'square', 0.2),

  reveal: () => {
    [261, 329, 392, 523].forEach((f, i) => playTone(f, 0.12, 'sine', 0.2, i * 0.08))
  },

  impostorReveal: () => {
    playTone(200, 0.3, 'sawtooth', 0.2)
    playTone(150, 0.4, 'sawtooth', 0.2, 0.3)
  },

  victory: () => {
    [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.15, 'sine', 0.25, i * 0.1))
  },

  defeat: () => {
    [392, 330, 261].forEach((f, i) => playTone(f, 0.2, 'sawtooth', 0.2, i * 0.15))
  },

  join: () => {
    playTone(440, 0.1, 'sine', 0.2)
    playTone(880, 0.15, 'sine', 0.2, 0.12)
  },

  error: () => {
    playTone(200, 0.15, 'square', 0.25)
    playTone(150, 0.2, 'square', 0.25, 0.15)
  },
}

export function resumeAudio() {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
  } catch {
    // ignore
  }
}
