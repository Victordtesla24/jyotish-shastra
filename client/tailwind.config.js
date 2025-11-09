/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Vedic Colors
        'vedic-primary': '#FF6B35',
        'vedic-secondary': '#8B4513',
        'vedic-accent': '#FFD700',
        'vedic-gold': '#FFD700',
        'vedic-saffron': '#FF9933',
        'vedic-maroon': '#800000',
        'vedic-deep-blue': '#000080',
        'vedic-lotus-pink': '#FFC0CB',

        // Celestial Colors
        'cosmic-purple': '#6B46C1',
        'stellar-blue': '#1E40AF',
        'lunar-silver': '#C0C0C0',
        'solar-orange': '#F97316',

        // Sacred Neutrals
        'sacred-white': '#FFFEF7',
        'wisdom-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'earth-brown': {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },

        // Extended Vedic Palette
        'divine-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'spiritual-saffron': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'sacred-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'peaceful-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'prosperity-green': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Dark theme support
        'dark-bg-primary': '#0f172a',
        'dark-bg-secondary': '#1e293b',
        'dark-text-primary': '#f1f5f9',
        'dark-text-secondary': '#cbd5e1',
      },

      fontFamily: {
        'sanskrit': ['Noto Sans Devanagari', 'sans-serif'],
        'vedic': ['Crimson Text', 'serif'],
        'cinzel': ['Cinzel', 'serif'],
        'devanagari': ['Noto Sans Devanagari', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
        'sans': ['Roboto', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      backgroundImage: {
        'gradient-vedic-primary': 'linear-gradient(135deg, #FF6B35 0%, #8B4513 100%)',
        'gradient-vedic-secondary': 'linear-gradient(135deg, #8B4513 0%, #FF6B35 100%)',
        'gradient-vedic-accent': 'linear-gradient(90deg, #FFD700, #E6C200)',
        'gradient-cosmic': 'linear-gradient(135deg, #6B46C1 0%, #1E40AF 100%)',
        'gradient-celestial': 'linear-gradient(135deg, #1E40AF 0%, #6B46C1 100%)',
      },

      boxShadow: {
        'cosmic': '0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 240, 230, 0.3)',
        'celestial': '0 8px 25px rgba(0, 0, 0, 0.2), 0 0 20px rgba(107, 70, 193, 0.3)',
        'mandala': '0 12px 24px rgba(139, 69, 19, 0.2), 0 0 20px rgba(255, 107, 53, 0.4)',
      },

      animation: {
        'chart-rotate': 'spin 120s linear infinite',
        'planet-orbit': 'orbit 60s linear infinite',
        'float': 'float 20s ease-in-out infinite',
        'celestial-glow': 'celestial-glow 4s ease-in-out infinite alternate',
        'sacred-pulse': 'sacred-pulse 3s ease-in-out infinite',
        'om-rotation': 'om-rotation 8s ease-in-out infinite',
        'lotus-bloom': 'lotus-bloom 6s ease-in-out infinite',
        'cosmic-drift': 'cosmic-drift 15s ease-in-out infinite',
        'divine-light': 'divine-light 4s ease-in-out infinite',
        'glow': 'celestial-glow 2s ease-in-out infinite alternate',
      },

      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(50px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(50px) rotate(-360deg)' }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(5deg)',
          }
        },
        'celestial-glow': {
          '0%': {
            boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6)',
          }
        },
        'sacred-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 10px rgba(255, 153, 51, 0.3)',
          },
          '50%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 20px rgba(255, 153, 51, 0.6), 0 0 30px rgba(255, 215, 0, 0.4)',
          }
        },
        'om-rotation': {
          '0%': {
            transform: 'rotate(0deg) scale(1)',
          },
          '25%': {
            transform: 'rotate(90deg) scale(1.1)',
          },
          '50%': {
            transform: 'rotate(180deg) scale(1)',
          },
          '75%': {
            transform: 'rotate(270deg) scale(1.1)',
          },
          '100%': {
            transform: 'rotate(360deg) scale(1)',
          }
        },
        'lotus-bloom': {
          '0%': {
            transform: 'scale(0.8) rotate(-5deg)',
            opacity: '0.7',
          },
          '50%': {
            transform: 'scale(1.1) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1) rotate(5deg)',
            opacity: '0.9',
          }
        },
        'cosmic-drift': {
          '0%, 100%': {
            transform: 'translateX(0) translateY(0) rotate(0deg)',
          },
          '25%': {
            transform: 'translateX(10px) translateY(-5px) rotate(2deg)',
          },
          '50%': {
            transform: 'translateX(-5px) translateY(-10px) rotate(-1deg)',
          },
          '75%': {
            transform: 'translateX(-10px) translateY(5px) rotate(1deg)',
          }
        },
        'divine-light': {
          '0%': {
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            transform: 'scale(1)',
          },
          '50%': {
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 153, 51, 0.1) 50%, transparent 70%)',
            transform: 'scale(1.2)',
          },
          '100%': {
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
            transform: 'scale(1)',
          }
        }
      }
    },
  },
  plugins: [],
}
