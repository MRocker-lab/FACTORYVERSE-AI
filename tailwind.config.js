/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Approved Dark Obsidian + Electric Purple Design System
        industrial: {
          950: '#030206', // Obsidian black background
          900: '#0A0713', // Primary surface: Deep charcoal / purple-black
          800: '#110D1B', // Elevated panel: Dark graphite
          700: '#211B34', // Subtle purple-grey card border / surface
          600: '#33294F', // Muted interactive border
        },
        obsidian: {
          950: '#030206',
          900: '#0A0713',
          800: '#110D1B',
          700: '#211B34',
          600: '#33294F',
        },
        purple: {
          electric: '#7C3AED', // Primary accent: Electric purple
          lavender: '#A78BFA', // Secondary accent: Lavender
          deep: '#4C1D95',
          glow: '#6D28D9',
        },
        ink: {
          primary: '#F4F2FA',   // Primary text
          secondary: '#9A94B0', // Secondary text
          muted: '#6E6786',
        },
        enterprise: {
          50: '#F8F7FC',  // Light analytics canvas with subtle lavender undertone
          100: '#F1EFFA', // Secondary surface
          200: '#E2DEF0', // Hairline border
          300: '#CBC4E0', // Strong border
          800: '#1A1528', // Primary ink
          900: '#0A0713', // Deep ink
        },
        telemetry: {
          cyan: '#A78BFA',    // Remapped to Lavender secondary accent for unified purple identity
          purple: '#7C3AED',  // Electric purple primary accent
          lavender: '#A78BFA',// Lavender secondary accent
          blue: '#3B82F6',    // Information: Electric blue
          emerald: '#10B981', // Success / Nominal: Emerald green
          amber: '#F59E0B',   // Warning: Amber
          crimson: '#EF4444', // Critical: Crimson red
          violet: '#7C3AED',  // AI inference / Electric purple accent
        }
      },
      boxShadow: {
        'glow-purple': '0 0 24px -6px rgba(124, 58, 237, 0.42)',
        'glow-cyan': '0 0 22px -6px rgba(124, 58, 237, 0.38)',
        'glow-emerald': '0 0 18px -5px rgba(16, 185, 129, 0.32)',
        'panel-obsidian': '0 8px 30px -6px rgba(3, 2, 6, 0.7), inset 0 1px 0 0 rgba(167, 139, 250, 0.08)',
        'enterprise-card': '0 1px 3px 0 rgba(10, 7, 19, 0.06), 0 1px 2px -1px rgba(10, 7, 19, 0.04)',
        'enterprise-elevated': '0 10px 25px -5px rgba(10, 7, 19, 0.08), 0 8px 10px -6px rgba(10, 7, 19, 0.04)',
      },
      backgroundImage: {
        'command-grid': 'linear-gradient(to right, rgba(33, 27, 52, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(33, 27, 52, 0.35) 1px, transparent 1px)',
        'enterprise-grid': 'linear-gradient(to right, rgba(226, 222, 240, 0.65) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 222, 240, 0.65) 1px, transparent 1px)',
        'purple-radial': 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.14), transparent 70%)',
      }
    },
  },
  plugins: [],
}
