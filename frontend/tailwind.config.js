/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Keeps your manual toggle working
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          dark: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Kept your custom animations (breathing/float) as they are great for "AI" vibes
      keyframes: {
        'breathing': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'breathing': 'breathing 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "lofi",  // Your new "Light Mode" (Wireframe style)
      "black", // Your new "Dark Mode" (Pure black OLED style)
    ],
    darkTheme: "black",
  },
}