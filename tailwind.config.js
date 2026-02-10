/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#252525',
        'bg-tertiary': '#2f2f2f',
        'accent': '#e07a5f',
        'accent-light': '#f4a261',
        'text-primary': '#f5f5f5',
        'text-secondary': '#a0a0a0',
        'success': '#81b29a',
        'warning': '#f2cc8f',
      },
    },
  },
  plugins: [],
}
