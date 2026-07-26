/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          navy: '#1F3350',
          navyDark: '#152438',
          navyLight: '#2D4A73',
          terracotta: '#C1622B',
          terracottaLight: '#D97D45',
          terracottaDark: '#9E4D20',
          gold: '#E3A73C',
          goldLight: '#F0C878',
          cream: '#FBF4E9',
          creamDark: '#F3E7D5',
          ink: '#221D17',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        aurora: '0 20px 40px -12px rgba(31, 51, 80, 0.25)',
        'aurora-sm': '0 8px 20px -6px rgba(31, 51, 80, 0.15)',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInUp: {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        gradientShift: {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
        pulseSubtle: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.9',
          },
        },
        bounceOnce: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-10%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideInUp: 'slideInUp 0.7s ease-out forwards',
        gradientShift: 'gradientShift 10s ease infinite',
        pulseSubtle: 'pulseSubtle 2s infinite ease-in-out',
        bounceOnce: 'bounceOnce 1s ease-in-out',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};