/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#0a0a1a',
          card: '#16162a',
          cardHover: '#1e1e38',
          border: '#2d2d4e',
          primary: '#7c3aed',
          primaryHover: '#6d28d9',
          secondary: '#ec4899',
          secondaryHover: '#db2777',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          text: '#f1f5f9',
          muted: '#94a3b8',
          impostor: '#ef4444',
        },
      },
      fontFamily: {
        game: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'reveal': 'reveal 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        reveal: {
          '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
