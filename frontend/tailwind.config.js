/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': '#a8e8ff',
        'primary': '#00d4ff',
        'primary-container': '#00d4ff',
        'background': '#050508',
        'surface': '#050508',
        'surface-dim': '#050508',
        'surface-lowest': '#0e0e12',
        'surface-low': '#1b1b1f',
        'surface-container': '#1f1f23',
        'surface-high': '#2a292e',
        'surface-highest': '#353439',
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        'warning': '#eab308',
        'alert': '#f97316',
        'success': '#22c55e',
        'on-surface': '#e5e1e7',
        'outline-variant': '#3c494e',
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px',
      },
      animation: {
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
        'pulse-error': 'pulseError 2s ease-in-out infinite',
        'pulse-warning': 'pulseWarning 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'phone-shake': 'phoneShake 0.5s ease-in-out infinite',
        'critical-flash': 'criticalFlash 0.8s ease-in-out infinite',
        'bar-grow': 'barGrow 1s ease-out forwards',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' }
        },
        pulseError: {
          '0%,100%': { boxShadow: '0 0 20px rgba(239,68,68,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(239,68,68,0.7)' }
        },
        pulseWarning: {
          '0%,100%': { boxShadow: '0 0 15px rgba(234,179,8,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(234,179,8,0.5)' }
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        phoneShake: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' }
        },
        criticalFlash: {
          '0%,100%': { backgroundColor: 'rgba(147,0,10,0.2)' },
          '50%': { backgroundColor: 'rgba(147,0,10,0.4)' }
        },
        barGrow: {
          'from': { transform: 'scaleY(0)' },
          'to': { transform: 'scaleY(1)' }
        },
      },
    },
  },
  plugins: [],
}
