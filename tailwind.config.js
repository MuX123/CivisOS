/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: '#36393f',
          darker: '#2f3136',
          darkest: '#202225',
          blurple: '#5865F2',
          blurpleHover: '#4752C4',
          green: '#3BA55D',
          red: '#ED4245',
          yellow: '#FAA61A',
          text: {
            normal: '#dcddde',
            muted: '#72767d',
            header: '#ffffff',
          }
        }
      }
    },
  },
  plugins: [],
}
