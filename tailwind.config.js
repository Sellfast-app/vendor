// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: 'hsl(var(--primary))',
          'primary-secondary': 'hsl(var(--primary-secondary))',
          'primary-tertiary': 'hsl(var(--primary-tertiary))',
        },
      },
    },
    plugins: [],
  };