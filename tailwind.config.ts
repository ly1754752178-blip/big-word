import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FAF6F1',
        'surface-base': '#FAF6F1',
        'bg-card': 'rgba(255, 253, 250, 0.78)',
        'bg-card-raised': 'rgba(255, 253, 250, 0.85)',
        'bg-card-elevated': 'rgba(255, 255, 255, 0.92)',
        'bg-card-floating': 'rgba(255, 255, 255, 0.96)',
        'bg-glass': 'rgba(255, 255, 255, 0.45)',
        'border-soft': 'rgba(218, 205, 190, 0.5)',
        'border-glow': 'rgba(232, 141, 79, 0.35)',
        'text-primary': '#3D3229',
        'text-secondary': '#7D6E5E',
        'text-muted': '#9A8B7A',
        'accent-sunset': '#E88D4F',
        'accent-amber': '#F5C542',
        'accent-teal': '#5BA8A0',
        'accent-green': '#6BBF73',

        /* 模块语义色板 */
        'status-coral': '#E87A5D',
        'status-salmon': '#F4A698',
        'status-pale': '#FFF0ED',
        'talent-violet': '#8B5CF6',
        'talent-magenta': '#C758A0',
        'talent-gold': '#F5B041',
        'talent-pale': '#F5EFFF',
        'social-teal': '#2DD4BF',
        'social-cyan': '#38BDF8',
        'social-pale': '#ECFDFB',
        'wealth-emerald': '#34D399',
        'wealth-gold': '#D4AF37',
        'wealth-pale': '#ECFDF5',
        'calendar-indigo': '#6366F1',
        'calendar-sky': '#38BDF8',
        'calendar-pale': '#EEF2FF',
        'narrative-paper': '#FFF8F0',
        'narrative-cream': '#FDF6E3',
        'map-earth': '#8D6E63',
        'map-sunset': '#D9773E',
        'map-pale': '#F3E5D8',
        'phone-metal': '#C0C0C8',
        'phone-frame': '#8E8E93',
        'phone-glass': '#1C1C1E',
      },
      fontFamily: {
        heading: ['HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        body: ['LXGW WenKai', 'Source Han Sans SC', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'Inter', 'monospace'],
        number: ['JetBrains Mono', 'Inter', 'monospace'],
      },
      boxShadow: {
        soft: '0 8px 32px rgba(61, 50, 41, 0.08)',
        raised: '0 4px 16px rgba(61, 50, 41, 0.06)',
        elevated: '0 8px 28px rgba(61, 50, 41, 0.1)',
        floating: '0 16px 48px rgba(61, 50, 41, 0.14), 0 0 0 1px rgba(255,255,255,0.5)',
        glow: '0 4px 20px rgba(232, 141, 79, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 197, 66, 0.25)',
        'glow-violet': '0 0 24px rgba(139, 92, 246, 0.25)',
        'glow-teal': '0 0 24px rgba(45, 212, 191, 0.22)',
        'glow-emerald': '0 0 24px rgba(52, 211, 153, 0.22)',
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.22)',
        'phone-case':
          '0 0 0 2px #A1A1A6, 0 0 0 4px #C0C0C8, 0 24px 60px rgba(0,0,0,0.35), inset 0 0 20px rgba(255,255,255,0.15)',
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
