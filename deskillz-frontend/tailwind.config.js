/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core brand colors - cyberpunk gaming palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ba5ec',
          600: '#0086c9',
          700: '#026aa2',
          800: '#065986',
          900: '#0b4a6f',
          950: '#082f49',
        },
        // Neon accent colors
        neon: {
          cyan: '#00f0ff',
          purple: '#bf00ff',
          pink: '#ff0080',
          green: '#00ff88',
          yellow: '#ffff00',
          orange: '#ff6600',
          red: '#ff0044',
        },
        // Gaming dark theme
        gaming: {
          darker: '#05050a',
          dark: '#0a0a14',
          DEFAULT: '#0f0f1e',
          light: '#1a1a2e',
          lighter: '#25253d',
          border: '#2a2a4a',
        },
        // Status colors
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff0044',
        info: '#00f0ff',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'particle-float': 'particle-float 15s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)',
            borderColor: 'rgba(0, 240, 255, 0.5)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2)',
            borderColor: 'rgba(0, 240, 255, 0.8)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': { 
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          },
          '50%': { 
            textShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor',
          },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'particle-float': {
          '0%, 100%': { 
            transform: 'translate(0, 0) rotate(0deg)',
            opacity: '0.3',
          },
          '25%': { 
            transform: 'translate(100px, -100px) rotate(90deg)',
            opacity: '0.8',
          },
          '50%': { 
            transform: 'translate(0, -200px) rotate(180deg)',
            opacity: '0.3',
          },
          '75%': { 
            transform: 'translate(-100px, -100px) rotate(270deg)',
            opacity: '0.8',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
        'cyber-grid': 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
        'neon-glow': 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
        'grid-sm': '25px 25px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
        'neon-purple': '0 0 20px rgba(191, 0, 255, 0.5), 0 0 40px rgba(191, 0, 255, 0.2)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.5), 0 0 40px rgba(255, 0, 128, 0.2)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.2)',
        'inner-glow': 'inset 0 0 30px rgba(0, 240, 255, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 240, 255, 0.05)',
      },
      dropShadow: {
        'neon': '0 0 10px rgba(0, 240, 255, 0.8)',
        'neon-purple': '0 0 10px rgba(191, 0, 255, 0.8)',
        'neon-pink': '0 0 10px rgba(255, 0, 128, 0.8)',
      },
    },
  },
  plugins: [],
}
