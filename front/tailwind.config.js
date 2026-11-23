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
          sun: '#FFC857',
          coral: '#F2704B',
          berry: '#8E3B6B',
          teal: '#2F9E8F',
          plum: '#4A2C5C',
          plumDark: '#2B1F45',
        },
      },
      fontFamily: {
        display: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        aurora: '0 20px 40px -12px rgba(31, 51, 80, 0.25)',
        'aurora-sm': '0 8px 20px -6px rgba(31, 51, 80, 0.15)',
        'aurora-glow': '0 12px 32px -8px rgba(193, 98, 43, 0.55)',
        'aurora-lg': '0 30px 60px -20px rgba(31, 51, 80, 0.35)',
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
        blobMove: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(30px, -40px, 0) scale(1.1)' },
          '66%': { transform: 'translate3d(-25px, 25px, 0) scale(0.95)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
        ringPulse: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
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
        blobMove: 'blobMove 18s ease-in-out infinite',
        marquee: 'marquee 38s linear infinite',
        shine: 'shine 3.2s ease-in-out infinite',
        ringPulse: 'ringPulse 2.4s ease-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};