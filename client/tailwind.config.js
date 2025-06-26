/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        vedic: ['"Noto Sans Devanagari"', 'sans-serif'],
        accent: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
