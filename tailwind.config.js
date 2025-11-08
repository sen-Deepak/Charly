/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22577a',
          100: '#071219',
          200: '#0e2331',
          300: '#15354a',
          400: '#1c4663',
          500: '#22577a',
          600: '#327fb2',
          700: '#5aa1d1',
          800: '#91c1e0',
          900: '#c8e0f0',
        },
        secondary: {
          DEFAULT: '#38a3a5',
          100: '#0b2021',
          200: '#164141',
          300: '#226162',
          400: '#2d8183',
          500: '#38a3a5',
          600: '#52c2c4',
          700: '#7dd1d3',
          800: '#a8e0e1',
          900: '#d4f0f0',
        },
        accent: {
          DEFAULT: '#57cc99',
          100: '#0e2c1f',
          200: '#1b593e',
          300: '#29855d',
          400: '#37b27c',
          500: '#57cc99',
          600: '#79d6ad',
          700: '#9ae0c2',
          800: '#bcead6',
          900: '#ddf5eb',
        },
        success: {
          DEFAULT: '#80ed99',
          100: '#094016',
          200: '#12812c',
          300: '#1cc142',
          400: '#42e468',
          500: '#80ed99',
          600: '#9bf1af',
          700: '#b4f4c3',
          800: '#cdf8d7',
          900: '#e6fbeb',
        },
        light: {
          DEFAULT: '#c7f9cc',
          100: '#095110',
          200: '#11a220',
          300: '#25e839',
          400: '#76f183',
          500: '#c7f9cc',
          600: '#d3fad7',
          700: '#defce1',
          800: '#e9fdeb',
          900: '#f4fef5',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

