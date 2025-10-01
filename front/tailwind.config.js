/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Animación para que los elementos aparezcan desde abajo y se desvanezcan
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
        // Animación para que los elementos se deslicen hacia arriba
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
        // Animación para el cambio de gradiente (usado en HeroBanner)
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
        // Animación de pulso sutil (usado en CTA para emprendedores)
        pulseSubtle: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.9',
          },
        },
        // Animación de rebote una vez (usado en CTA para emprendedores)
        bounceOnce: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-10%)', // Ajusta la altura del rebote
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideInUp: 'slideInUp 0.7s ease-out forwards',
        gradientShift: 'gradientShift 10s ease infinite', // Ajusta la duración y el tipo de repetición
        pulseSubtle: 'pulseSubtle 2s infinite ease-in-out', // Ajusta la duración y el tipo de repetición
        bounceOnce: 'bounceOnce 1s ease-in-out', // Ajusta la duración
      },
        
    },
  },
  plugins: [
     require('@tailwindcss/typography'),
  ],
};