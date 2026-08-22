export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#F4F2E6', soft: '#FBFAF3' },
        ink: { DEFAULT: '#282140', soft: '#342E4A', muted: '#8B8579' },
        lime: { DEFAULT: '#D5EF74', dark: '#BEE04C' },
        coral: { DEFAULT: '#FF9D84', soft: '#FFE7DC' },
        teal: { DEFAULT: '#9EDBD3', soft: '#E6F6F3' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        lift: '0 18px 44px -22px rgba(40, 33, 64, 0.45)',
        card: '0 2px 6px -2px rgba(40, 33, 64, 0.08), 0 10px 30px -18px rgba(40, 33, 64, 0.35)',
      },
    },
  },
}
