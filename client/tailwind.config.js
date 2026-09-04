/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          dark: '#0B0D13',
          card: '#121622',
          cardHover: '#181E2E',
          border: '#232A3D',
          red: '#E10600',
          redGlow: '#FF1E27',
          orange: '#FF8000',
          cyan: '#00F0FF',
          green: '#00E676',
          yellow: '#FFB800',
          purple: '#8E24AA',
          muted: '#8B949E'
        }
      },
      fontFamily: {
        racing: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nitro-glow': 'nitro 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        nitro: {
          '0%': { filter: 'drop-shadow(0 0 8px #00F0FF) drop-shadow(0 0 20px #00F0FF)' },
          '100%': { filter: 'drop-shadow(0 0 20px #FF8000) drop-shadow(0 0 40px #E10600)' }
        }
      }
    },
  },
  plugins: [],
};
