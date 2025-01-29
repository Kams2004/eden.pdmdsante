/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        scroll: 'scroll 30s linear infinite', // Adds the scroll animation
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },       // Start at the original position
          '100%': { transform: 'translateX(-100%)' } // Move out of the viewport to the left
        },
      },
    },
  },
  plugins: [],
};
