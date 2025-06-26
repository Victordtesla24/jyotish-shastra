/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // Enable dark mode support with class-based switching
  theme: {
    extend: {
      // === VEDIC COLOR SYSTEM ===
      colors: {
        // Primary Vedic Colors
        'vedic-saffron': 'var(--vedic-saffron)',
        'vedic-gold': 'var(--vedic-gold)',
        'vedic-maroon': 'var(--vedic-maroon)',
        'vedic-deep-blue': 'var(--vedic-deep-blue)',
        'vedic-lotus-pink': 'var(--vedic-lotus-pink)',

        // Current Theme Colors (Compatibility)
        'vedic-primary': 'var(--vedic-primary)',
        'vedic-secondary': 'var(--vedic-secondary)',
        'vedic-accent': 'var(--vedic-accent)',

        // Celestial Colors
        'cosmic-purple': 'var(--cosmic-purple)',
        'stellar-blue': 'var(--stellar-blue)',
        'lunar-silver': 'var(--lunar-silver)',
        'solar-orange': 'var(--solar-orange)',

        // Sacred Neutrals
        'sacred-white': 'var(--sacred-white)',
        'wisdom-gray': 'var(--wisdom-gray)',
        'earth-brown': 'var(--earth-brown)',

        // Text Colors
        'vedic-text': 'var(--vedic-text)',
        'vedic-text-light': 'var(--vedic-text-light)',
        'vedic-text-muted': 'var(--vedic-text-muted)',

        // Background Colors
        'vedic-background': 'var(--vedic-background)',
        'vedic-surface': 'var(--vedic-surface)',
        'vedic-border': 'var(--vedic-border)',

        // Extended Palette
        'saffron-light': 'var(--saffron-light)',
        'saffron-subtle': 'var(--saffron-subtle)',
        'gold-pure': 'var(--gold-pure)',
        'gold-champagne': 'var(--gold-champagne)',
        'orange-coral': 'var(--orange-coral)',
      },

      // === TYPOGRAPHY SYSTEM ===
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'devanagari': ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        'cinzel': ['Cinzel', 'serif'],
        'vedic': ['Inter', 'system-ui', 'sans-serif'], // Alias for consistency
        'accent': ['Cinzel', 'serif'], // Alias for headings
      },

      // === EXTENDED FONT SIZES ===
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      // === EXTENDED SPACING ===
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // === BORDER RADIUS ===
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'base': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'full': '9999px',
      },

      // === BOX SHADOWS ===
      boxShadow: {
        'soft': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'strong': '0 10px 20px rgba(0, 0, 0, 0.15)',
        'cosmic': '0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 240, 230, 0.3)',
        'celestial': '0 8px 25px rgba(0, 0, 0, 0.2), 0 0 20px rgba(107, 70, 193, 0.3)',
        'mandala': '0 12px 24px rgba(139, 69, 19, 0.2), 0 0 20px rgba(255, 107, 53, 0.4)',
        'vedic': '0 4px 20px rgba(255, 107, 53, 0.15)',
        'gold': '0 4px 20px rgba(255, 215, 0, 0.3)',
      },

      // === EXTENDED ANIMATIONS ===
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-delay': 'fadeInUp 0.8s ease-out 0.4s forwards',
        'fade-in-delay-2': 'fadeInUp 0.8s ease-out 0.8s forwards',
        'text-focus-in': 'textFocusIn 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both',
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 20s ease-in-out infinite',
        'celestial-glow': 'celestialGlow 4s ease-in-out infinite alternate',
        'mandala-rotate': 'spin 30s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-vedic': 'pulseVedic 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-vedic': 'bounceVedic 1s infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },

      // === KEYFRAMES ===
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        textFocusIn: {
          '0%': {
            '-webkit-filter': 'blur(12px)',
            filter: 'blur(12px)',
            opacity: '0',
          },
          '100%': {
            '-webkit-filter': 'blur(0px)',
            filter: 'blur(0px)',
            opacity: '1',
          },
        },
        glow: {
          '0%, 100%': {
            textShadow: '0 0 5px #FF9933, 0 0 10px #FF9933',
          },
          '50%': {
            textShadow: '0 0 10px #FF9933, 0 0 20px #FF9933',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(5deg)',
          },
        },
        celestialGlow: {
          '0%': {
            boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6)',
          },
        },
        pulseVedic: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        bounceVedic: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        twinkle: {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(0.8)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },

      // === TIMING FUNCTIONS ===
      transitionTimingFunction: {
        'vedic': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'celestial': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },

      // === TRANSITION DURATIONS ===
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '1000': '1000ms',
      },

      // === BACKDROP BLUR ===
      backdropBlur: {
        'vedic': '12px',
        'celestial': '16px',
      },

      // === GRID TEMPLATE COLUMNS ===
      gridTemplateColumns: {
        'mandala': 'repeat(3, minmax(0, 1fr))',
        'cosmic': 'repeat(auto-fit, minmax(250px, 1fr))',
        'celestial': 'repeat(auto-fit, minmax(300px, 1fr))',
      },

      // === ASPECT RATIOS ===
      aspectRatio: {
        'mandala': '1 / 1',
        'golden': '1.618 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
      },

      // === Z-INDEX SCALE ===
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom plugin for Vedic utilities
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        // Text gradient utilities
        '.text-gradient-vedic': {
          background: 'linear-gradient(135deg, #FF6B35 0%, #8B4513 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          'filter': 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3))',
        },
        '.text-gradient-accent': {
          background: 'linear-gradient(90deg, #FFD700, #E6C200)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          'filter': 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3))',
        },
        '.text-gradient-cosmic': {
          background: 'linear-gradient(135deg, #6B46C1 0%, #1E40AF 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          'filter': 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3))',
        },

        // Background pattern utilities
        '.bg-grid-pattern': {
          'background-image': 'linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
          'background-size': '20px 20px',
        },

        // Vedic backdrop filter
        '.backdrop-vedic': {
          'backdrop-filter': 'blur(12px)',
          'background-color': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },

        // Custom scrollbar
        '.scrollbar-vedic': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#FFD700 transparent',
        },
        '.scrollbar-vedic::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-vedic::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar-vedic::-webkit-scrollbar-thumb': {
          'background-color': '#FFD700',
          'border-radius': '3px',
        },
      };

      const newComponents = {
        // Vedic button variants
        '.btn-vedic': {
          '@apply inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl transition-all duration-300 ease-vedic focus:outline-none focus:ring-3 focus:ring-offset-2 relative overflow-hidden': {},
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            transition: 'left 0.6s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        },

        // Vedic card system
        '.card-vedic': {
          '@apply bg-vedic-surface rounded-2xl shadow-medium border border-vedic-border transition-all duration-300 ease-vedic hover:shadow-mandala hover:-translate-y-2 relative overflow-hidden': {},
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #8B4513 100%)',
          },
        },

        // Vedic input system
        '.input-vedic': {
          '@apply w-full px-4 py-3 rounded-xl border border-vedic-border bg-vedic-surface text-vedic-text transition-all duration-300 ease-vedic focus:border-vedic-primary focus:ring-3 focus:ring-vedic-primary focus:ring-opacity-20 hover:border-vedic-accent': {},
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
}
