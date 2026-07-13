import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { TavernLobby } from '@/app/TavernLobby';
import { GameLayout } from '@/app/GameLayout';

type Page = 'lobby' | 'menu' | 'game';

/** 渐黑过渡阶段 */
type FadePhase = 'none' | 'fade-out' | 'hold' | 'fade-in';

const FADE_DURATION = 700; // ms，与 CSS transition 保持一致

export default function App() {
  const [page, setPage] = useState<Page>('lobby');
  const [fadePhase, setFadePhase] = useState<FadePhase>('none');

  /** 带渐黑渐明效果的页面切换 */
  const transitionTo = (target: Page) => {
    setFadePhase('fade-out');
    requestAnimationFrame(() => {
      setFadePhase('hold');
      setTimeout(() => {
        setPage(target);
        setFadePhase('fade-in');
        setTimeout(() => setFadePhase('none'), FADE_DURATION);
      }, FADE_DURATION);
    });
  };

  // 从游戏内「返回主菜单」→ 跳过光球，直接进入视频背景 + 菜单
  const goToMenu = () => transitionTo('menu');
  // 从主菜单「开始游戏」→ 进入正文
  const goToGame = () => transitionTo('game');

  return (
    <GameProvider>
      {/* 大厅（含光球） */}
      {page === 'lobby' && (
        <TavernLobby onEnterGame={goToGame} skipOrb={false} />
      )}

      {/* 主菜单（无光球，视频背景 + 菜单按钮） */}
      {page === 'menu' && (
        <TavernLobby onEnterGame={goToGame} skipOrb={true} />
      )}

      {/* 游戏正文 */}
      {page === 'game' && (
        <GameLayout onBackToLobby={goToMenu} />
      )}

      {/* 渐黑遮罩层 */}
      {fadePhase !== 'none' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'black',
            opacity: fadePhase === 'hold' ? 1 : 0,
            transition: `opacity ${FADE_DURATION}ms ease-in-out`,
            pointerEvents: 'none',
          }}
        />
      )}
    </GameProvider>
  );
}
