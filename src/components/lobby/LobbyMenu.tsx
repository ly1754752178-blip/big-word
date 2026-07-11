// src/components/lobby/LobbyMenu.tsx
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

export function LobbyMenu(props: LobbyMenuProps) {
  return (
    <nav className="lobby-menu">
      {menuItems.map((item) => {
        const handler = props[item.onClick as keyof LobbyMenuProps];
        return (
          <button
            key={item.key}
            className="lobby-menu__item"
            onClick={handler}
          >
            <item.icon className="lobby-menu__icon" size={20} />
            <span className="lobby-menu__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
