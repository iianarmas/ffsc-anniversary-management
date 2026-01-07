/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          main: '#0f2a71',
          hover: '#1c3b8d',
          light: '#e8edf7',
          lighter: '#f5f7fb',
        },
        'accent': {
          main: '#db8916',
          hover: '#c47a12',
          light: '#fef3e6',
        },
        'navy': {
          darkest: '#001740',
          dark: '#0f204e',
        }
      },
      zIndex: {
        'mobile-nav': '30',
        'mobile-header': '20',
        'sidebar': '40',
        'header': '30',
        'modal-backdrop': '50',
        'modal': '60',
        'dropdown': '70',
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(15, 42, 113, 0.08)',
        'card': '0 4px 16px rgba(15, 42, 113, 0.1)',
        'card-hover': '0 8px 24px rgba(15, 42, 113, 0.15)',
        'dialog': '0 20px 40px rgba(15, 42, 113, 0.2)',
        'dropdown': '0 8px 20px rgba(15, 42, 113, 0.12)',
      },
      borderRadius: {
        'card': '12px',
        'dialog': '16px',
        'button': '10px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    }
  },
  plugins: [],
}