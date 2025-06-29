/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vedic-primary': '#FF6B35',
        'vedic-secondary': '#8B4513',
        'vedic-saffron': '#FF9933',
        'vedic-gold': '#FFD700',
        'vedic-maroon': '#800000',
        'vedic-deep-blue': '#000080',
        'vedic-lotus-pink': '#FFC0CB',
        'cosmic-purple': '#6B46C1',
        'stellar-blue': '#1E40AF',
        'lunar-silver': '#C0C0C0',
        'solar-orange': '#F97316',
        'sacred-white': '#FFFEF7',
        'wisdom-gray': '#6B7280',
        'earth-brown': '#92400E',
        'dark-bg-primary': '#1a202c',
        'dark-surface': '#2d3748',
        'dark-text-primary': '#edf2f7',
        'dark-text-secondary': '#a0aec0',
        'dark-border': '#4a5568',
        'dark-cosmic': '#9f7aea',
        'vedic-background': '#f7fafc',
        'dark-bg-tertiary': '#4a5568',
        'dark-text-muted': '#718096',
        'saffron': '#F59E0B',
        'dark-vedic-saffron': '#F59E0B',
        'dark-surface-elevated': '#3B3B58',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Noto Sans Devanagari', 'serif'],
        accent: ['Cinzel', 'serif'],
      },
      boxShadow: {
        'vedic-soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'vedic-medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'vedic-strong': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        'cosmic': '0 0 15px rgba(107, 70, 193, 0.5)',
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      borderRadius: {
        'vedic': '0.625rem',
      },
    },
  },
  plugins: [],
}
