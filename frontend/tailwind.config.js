/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1280px' } },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        numeric: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
          50: '#F1F0FE',
          100: '#E4E2FD',
          200: '#C9C5FB',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },
        mint: {
          DEFAULT: '#10B981',
          dark: '#059669',
          soft: '#E7F8F0',
        },
        ink: {
          DEFAULT: '#0F172A',
          soft: '#334155',
          muted: '#6B7280',
          faint: '#9AA2B1',
        },
        surface: {
          DEFAULT: '#F4F5F7',
          card: '#FFFFFF',
          sunken: '#F8F9FB',
        },
        line: '#EDEFF3',
        danger: '#EF4444',
        warn: '#F59E0B',
        muted: { DEFAULT: '#F4F5F7', foreground: '#6B7280' },
        accent: { DEFAULT: '#F1F0FE', foreground: '#4F46E5' },
        destructive: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#0F172A' },
        card: { DEFAULT: '#FFFFFF', foreground: '#0F172A' },
      },
      borderRadius: { xl: '14px', '2xl': '18px', '3xl': '24px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.03)',
        lift: '0 8px 24px -12px rgba(16,24,40,0.16)',
        pop: '0 16px 40px -18px rgba(37,32,110,0.35)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
      },
      animation: { 'fade-up': 'fade-up .32s cubic-bezier(.16,1,.3,1) both' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
