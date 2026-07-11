import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { TavernLobby } from '@/app/TavernLobby';
import { GameLayout } from '@/app/GameLayout';

type Page = 'lobby' | 'game';

export default function App() {
  const [page, setPage] = useState<Page>('lobby');

  return (
    <GameProvider>
      {page === 'lobby' ? (
        <TavernLobby onEnterGame={() => setPage('game')} />
      ) : (
        <GameLayout onBackToLobby={() => setPage('lobby')} />
      )}
    </GameProvider>
  );
}
