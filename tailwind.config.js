/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#006948',
        'primary-container': '#00855d',
        'primary-fixed': '#85f8c4',
        'on-primary': '#ffffff',
        'emerald-tint': '#ECFDF5',
        'emerald-light': '#A7F3D0',
        'surface': '#f8f9ff',
        'surface-white': '#FFFFFF',
        'surface-muted': '#F1F5F9',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-low': '#eff4ff',
        'danger-coral': '#F43F5E',
        'danger-tint': '#FFF1F2',
        'error': '#ba1a1a',
        'text-primary': '#0F172A',
        'text-secondary': '#334155',
        'text-muted': '#64748B',
        'border-strong': '#E2E8F0',
        'border-subtle': '#EAECF0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        'nav-bottom-height': '4.5rem',
      }
    },
  },
  plugins: [],
}
