/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dripBlue: '#4A90E2',
        darkBg: '#0f0f12',
      }
    },
  },
  plugins: [],
}