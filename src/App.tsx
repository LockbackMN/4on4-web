import { useState } from 'react';
import { PlayersTab } from './components/PlayersTab';
import { GameTab } from './components/GameTab';
import { useLeagueStore } from './store/useLeagueStore';

type Tab = 'players' | 'game';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('players');
  const [showNewDayDialog, setShowNewDayDialog] = useState(false);
  const { startNewDay, currentGame } = useLeagueStore();

  function confirmNewDay() {
    startNewDay();
    setShowNewDayDialog(false);
    setActiveTab('players');
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-[#EEF1F7] relative">
      {/* Header */}
      <header
        className="text-white px-4 flex items-center justify-between shadow-md flex-shrink-0"
        style={{
          backgroundColor: '#002B5C',
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
          paddingBottom: '12px',
        }}
      >
        <h1 className="text-xl font-bold tracking-tight">4-on-4 Basketball</h1>
        <button
          onClick={() => setShowNewDayDialog(true)}
          className="text-sm font-semibold bg-white/20 rounded-xl px-3 py-1.5 active:scale-95 transition-transform"
        >
          New Day
        </button>
      </header>

      {/* Tab content — scrollable */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'players' ? <PlayersTab /> : <GameTab />}
      </main>

      {/* Bottom nav */}
      <nav
        className="flex-shrink-0 bg-white border-t border-gray-200 flex shadow-[0_-1px_4px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          onClick={() => setActiveTab('players')}
          className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors"
          style={{ color: activeTab === 'players' ? '#002B5C' : '#9CA3AF' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="text-xs font-medium">Players</span>
        </button>

        <button
          onClick={() => setActiveTab('game')}
          className="flex-1 flex flex-col items-center py-3 gap-1 transition-colors relative"
          style={{ color: activeTab === 'game' ? '#002B5C' : '#9CA3AF' }}
        >
          {currentGame && (
            <span className="absolute top-2 right-8 w-2 h-2 rounded-full" style={{ backgroundColor: '#8CCE26' }} />
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M4.93 4.93l4.24 4.24"/>
            <path d="M14.83 9.17l4.24-4.24"/>
            <path d="M14.83 14.83l4.24 4.24"/>
            <path d="M9.17 14.83l-4.24 4.24"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <span className="text-xs font-medium">Game</span>
        </button>
      </nav>

      {/* New Day confirmation dialog */}
      {showNewDayDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <h2 className="text-xl font-bold text-center" style={{ color: '#002B5C' }}>Start New Day?</h2>
            <p className="text-gray-500 text-center text-sm">
              This will reset all players to inactive, clear game counters, and end any active game.
            </p>
            <button
              onClick={confirmNewDay}
              className="w-full py-3 rounded-2xl text-white font-bold text-base active:scale-95 transition-transform"
              style={{ backgroundColor: '#002B5C' }}
            >
              Yes, New Day
            </button>
            <button
              onClick={() => setShowNewDayDialog(false)}
              className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-base active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
