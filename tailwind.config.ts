import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FAF6F1',
        'bg-card': 'rgba(255, 253, 250, 0.78)',
        'bg-glass': 'rgba(255, 255, 255, 0.45)',
        'border-soft': 'rgba(218, 205, 190, 0.5)',
        'text-primary': '#3D3229',
        'text-secondary': '#7D6E5E',
        'accent-sunset': '#E88D4F',
        'accent-amber': '#F5C542',
        'accent-teal': '#5BA8A0',
        'accent-green': '#6BBF73',
      },
      fontFamily: {
        heading: ['HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        body: ['LXGW WenKai', 'Source Han Sans SC', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'Inter', 'monospace'],
      },
      boxShadow: {
        soft: '0 8px 32px rgba(61, 50, 41, 0.08)',
        glow: '0 4px 20px rgba(232, 141, 79, 0.25)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
