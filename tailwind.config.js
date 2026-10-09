/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        junior: {
          blue: '#2563eb',
          purple: '#7c3aed',
          amber: '#f59e0b',
          green: '#10b981',
          rose: '#f43f5e',
          sky: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['"Comic Neue"', 'Nunito', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
