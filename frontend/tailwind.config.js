export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neonGreen: '#00ff41', // Brighter fluorescent green for borders/glows
      },
      animation: {
        'spinChakra': 'spinChakra 1s linear infinite',
        'neonPulse': 'neonPulse 2s ease-in-out infinite',
        'floatIn': 'floatIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
      },
      keyframes: {
        spinChakra: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 15px #39ff14' },
          '50%': { boxShadow: '0 0 20px #39ff14, 0 0 30px #39ff14, 0 0 40px #39ff14' },
        },
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
