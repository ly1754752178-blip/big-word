import { Gamepad2, FolderOpen, BookOpen, Plug, Sliders, Settings } from 'lucide-react';

interface LobbyMenuProps {
  onStartGame: () => void;
  onContinue: () => void;
  onWorldBooks: () => void;
  onApiConfig: () => void;
  onPresets: () => void;
  onSettings: () => void;
}

const menuItems = [
  { key: 'start', label: '开始游戏', icon: Gamepad2, onClick: 'onStartGame' },
  { key: 'continue', label: '继续游戏', icon: FolderOpen, onClick: 'onContinue' },
  { key: 'worldbooks', label: '世界书', icon: BookOpen, onClick: 'onWorldBooks' },
  { key: 'api', label: 'API 配置', icon: Plug, onClick: 'onApiConfig' },
  { key: 'presets', label: '预设', icon: Sliders, onClick: 'onPresets' },
  { key: 'settings', label: '设置', icon: Settings, onClick: 'onSettings' },
] as const;

// 内联样式，z-index: 9999 强制置于最前
const menuStyle: React.CSSProperties = {
  position: 'fixed',
  left: 48,
  bottom: 60,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 24px',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  color: 'white',
  fontSize: '1.05rem',
  fontWeight: 500,
  cursor: 'pointer',
  minWidth: 200,
};

export function LobbyMenu(props: LobbyMenuProps) {
  return (
    <nav style={menuStyle}>
      {menuItems.map((item) => {
        const handler = props[item.onClick as keyof LobbyMenuProps];
        return (
          <button
            key={item.key}
            style={itemStyle}
            onClick={handler}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.25)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              e.currentTarget.style.transform = 'translateX(6px)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <item.icon size={20} style={{ opacity: 0.8 }} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
