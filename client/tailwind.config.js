/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Vedic Primary Palette (shortened names)
        'saffron': '#FF9933',
        'gold': '#FFD700',
        'maroon': '#800000',
        'navy': '#000080',
        'lotus': '#FFC0CB',

        // Cosmic Palette
        'cosmic-purple': '#6B46C1',
        'stellar-blue': '#1E40AF',
        'lunar-silver': '#C0C0C0',
        'solar-orange': '#F97316',

        // Sacred Palette
        'sacred-white': '#FFFEF7',
        'wisdom-gray': '#6B7280',
        'earth-brown': '#92400E',

        // Dark Mode Vedic Palette
        'dark': {
          'bg-primary': '#0F0F23',
          'bg-secondary': '#1A1A2E',
          'bg-tertiary': '#16213E',
          'surface': '#2D2D44',
          'surface-elevated': '#3B3B58',
          'border': '#4A4A6A',
          'text-primary': '#E5E5F4',
          'text-secondary': '#B8B8CC',
          'text-muted': '#8B8BA0',
          'accent': '#7C3AED',
          'cosmic': '#6366F1',
          'vedic-gold': '#FBBF24',
          'vedic-saffron': '#F59E0B',
        },

        // Vedic Semantic Colors (backward compatibility)
        'vedic-saffron': '#FF9933',
        'vedic-gold': '#FFD700',
        'vedic-maroon': '#800000',
        'vedic-deep-blue': '#000080',
        'vedic-lotus-pink': '#FFC0CB',

        // Gradient-friendly colors
        'gradient': {
          'cosmic-start': '#4C1D95',
          'cosmic-end': '#1E40AF',
          'vedic-start': '#FF9933',
          'vedic-end': '#800000',
          'celestial-start': '#6B46C1',
          'celestial-end': '#F97316',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        vedic: ['"Noto Sans Devanagari"', 'serif'],
        accent: ['Cinzel', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'vedic-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'vedic-base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.015em' }],
        'vedic-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0.01em' }],
        'vedic-xl': ['1.25rem', { lineHeight: '1.8', letterSpacing: '0.005em' }],
        'vedic-2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0em' }],
        'vedic-3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'vedic-4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'vedic': '0.625rem',
        'mandala': '50%',
      },
      boxShadow: {
        'vedic-soft': '0 2px 8px rgba(139, 69, 19, 0.1)',
        'vedic-medium': '0 4px 12px rgba(139, 69, 19, 0.15)',
        'vedic-strong': '0 8px 24px rgba(139, 69, 19, 0.2)',
        'cosmic': '0 8px 32px rgba(76, 29, 149, 0.15)',
        'golden': '0 8px 32px rgba(255, 215, 0, 0.2)',
        'celestial': '0 0 40px rgba(107, 70, 193, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'mandala-rotate': 'spin 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-vedic': 'linear-gradient(135deg, #FF9933 0%, #800000 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, #6B46C1 0%, #1E40AF 100%)',
        'gradient-celestial': 'linear-gradient(135deg, #4C1D95 0%, #F97316 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-stellar': 'linear-gradient(45deg, #1E40AF, #6B46C1, #4C1D95)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // Custom plugin for Vedic-specific utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.text-vedic-shadow': {
          textShadow: '0 2px 4px rgba(139, 69, 19, 0.3)',
        },
        '.text-cosmic-glow': {
          textShadow: '0 0 20px rgba(107, 70, 193, 0.5)',
        },
        '.border-mandala': {
          borderImageSource: 'conic-gradient(from 0deg, #FF9933, #FFD700, #800000, #FF9933)',
          borderImageSlice: '1',
        },
        '.mandala-border': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '-1px',
            padding: '1px',
            background: 'conic-gradient(from 0deg, #FF9933, #FFD700, #800000, #FF9933)',
            borderRadius: 'inherit',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
