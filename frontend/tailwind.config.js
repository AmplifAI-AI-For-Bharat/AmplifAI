/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        devfolio: {
          blue: '#3770FF',
          green: '#27C499',
          yellow: '#F9B233',
          background: '#FFFFFF',
          muted: '#F4F7FE',
          text: {
            primary: '#121212',
            secondary: '#6B7280',
          }
        }
      },
      fontFamily: {
        sans: ['Nunito Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'df': '12px',
      },
      boxShadow: {
        'df': '0 4px 20px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
