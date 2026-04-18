/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: 'rgba(7,25,56,0.78)',
        border: 'rgba(80,178,255,0.35)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(54,169,255,0.25)',
      },
      animation: {
        scan: 'scanline 9s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
