import { useState, useCallback } from 'react';
import { useLeagueStore } from '../store/useLeagueStore';
import type { Player } from '../lib/storage';

function PlayerChip({
  player,
  isSelected,
  isFlashing,
  onTap,
  onSub,
  showSub,
}: {
  player: Player;
  isSelected: boolean;
  isFlashing: boolean;
  onTap: () => void;
  onSub: () => void;
  showSub: boolean;
}) {
  let borderColor = 'transparent';
  let bgColor = '#FFFFFF';

  if (isFlashing) {
    bgColor = '#E6F4EC';
    borderColor = '#8CCE26';
  } else if (isSelected) {
    bgColor = '#EEF1F7';
    borderColor = '#002B5C';
  }

  return (
    <div
      onClick={onTap}
      className="flex items-center gap-2 rounded-xl px-3 py-3 cursor-pointer select-none transition-colors active:scale-95 border-2 shadow-sm"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{player.name}</p>
        <p className="text-xs text-gray-400">{player.totalGamesPlayed} games</p>
      </div>
      {showSub && (
        <button
          onClick={e => { e.stopPropagation(); onSub(); }}
          className="text-xs rounded-lg px-2 py-1 font-bold active:scale-90 transition-transform flex-shrink-0"
          style={{ backgroundColor: '#8CCE26', color: '#002B5C' }}
        >
          SUB
        </button>
      )}
    </div>
  );
}

export function GameTab() {
  const {
    players,
    currentGame,
    toggleSkipNextGame,
    generateTeams,
    swapPlayers,
    endGame,
  } = useLeagueStore();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [flashingIds, setFlashingIds] = useState<Set<number>>(new Set());

  const activePlayers = players.filter(p => p.isActiveToday);
  const eligibleCount = activePlayers.filter(p => !p.skipNextGame).length;
  const canGenerate = eligibleCount >= 8;

  const flash = useCallback((ids: number[]) => {
    setFlashingIds(new Set(ids));
    setTimeout(() => setFlashingIds(new Set()), 700);
  }, []);

  function handlePlayerTap(player: Player) {
    if (!selectedPlayer) {
      setSelectedPlayer(player);
      return;
    }
    if (selectedPlayer.id === player.id) {
      setSelectedPlayer(null);
      return;
    }
    swapPlayers(selectedPlayer, player);
    flash([selectedPlayer.id, player.id]);
    setSelectedPlayer(null);
  }

  function handleSub(player: Player) {
    if (!currentGame || currentGame.sittingOut.length === 0) return;
    const sub = currentGame.sittingOut[0];
    swapPlayers(player, sub);
    flash([player.id, sub.id]);
    setSelectedPlayer(null);
  }

  function handleEndGame() {
    endGame();
    setSelectedPlayer(null);
    setFlashingIds(new Set());
  }

  // --- Setup mode ---
  if (!currentGame) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {/* Status bar */}
        <div
          className="rounded-2xl p-4 flex justify-between items-center shadow-sm"
          style={{
            backgroundColor: canGenerate ? '#8CCE26' : '#9EA2A2',
            color: canGenerate ? '#002B5C' : '#ffffff',
          }}
        >
          <div>
            <p className="text-2xl font-bold">{eligibleCount}</p>
            <p className="text-sm opacity-80">players ready</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm opacity-80">needed</p>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generateTeams}
          disabled={!canGenerate}
          className="w-full py-4 rounded-2xl text-white text-lg font-bold shadow-sm disabled:opacity-40 active:scale-95 transition-transform"
          style={{ backgroundColor: '#002B5C' }}
        >
          Generate Teams
        </button>

        {/* Active player list with skip toggles */}
        {activePlayers.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No players are active today.</p>
            <p className="text-sm">Go to Players tab and toggle players on.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {activePlayers.map(player => (
              <li key={player.id} className="bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.totalGamesPlayed} games</p>
                </div>
                {player.prioritizeNextGame && (
                  <span className="text-xs rounded-full px-2 py-0.5 font-medium" style={{ backgroundColor: '#EEF1F7', color: '#002B5C' }}>
                    Priority
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{player.skipNextGame ? 'Skipped' : 'Playing'}</span>
                  <button
                    onClick={() => toggleSkipNextGame(player.id)}
                    className="w-12 h-7 rounded-full transition-colors flex-shrink-0 relative"
                    style={{ backgroundColor: player.skipNextGame ? '#D1D5DB' : '#8CCE26' }}
                    aria-label={`Toggle skip for ${player.name}`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        player.skipNextGame ? 'translate-x-0.5' : 'translate-x-5'
                      }`}
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // --- Active game mode ---
  const hasBench = currentGame.sittingOut.length > 0;

  return (
    <div className="flex flex-col gap-3 p-4">
      {selectedPlayer && (
        <div className="rounded-2xl px-4 py-3 text-sm text-center border" style={{ backgroundColor: '#EEF1F7', borderColor: '#002B5C', color: '#002B5C' }}>
          <strong>{selectedPlayer.name}</strong> selected — tap another player to swap
        </div>
      )}

      {/* Teams — stacked on mobile, side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Team A */}
        <div className="rounded-2xl p-3" style={{ backgroundColor: '#EEF1F7' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#002B5C' }}>Team A</h2>
          <div className="flex flex-col gap-2">
            {currentGame.teamA.map(player => (
              <PlayerChip
                key={player.id}
                player={player}
                isSelected={selectedPlayer?.id === player.id}
                isFlashing={flashingIds.has(player.id)}
                onTap={() => handlePlayerTap(player)}
                onSub={() => handleSub(player)}
                showSub={hasBench}
              />
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="rounded-2xl p-3" style={{ backgroundColor: '#EEF1F7' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#002B5C' }}>Team B</h2>
          <div className="flex flex-col gap-2">
            {currentGame.teamB.map(player => (
              <PlayerChip
                key={player.id}
                player={player}
                isSelected={selectedPlayer?.id === player.id}
                isFlashing={flashingIds.has(player.id)}
                onTap={() => handlePlayerTap(player)}
                onSub={() => handleSub(player)}
                showSub={hasBench}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bench */}
      {hasBench && (
        <div className="bg-gray-100 rounded-2xl p-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Bench</h2>
          <div className="flex flex-col gap-2">
            {currentGame.sittingOut.map(player => (
              <PlayerChip
                key={player.id}
                player={player}
                isSelected={selectedPlayer?.id === player.id}
                isFlashing={flashingIds.has(player.id)}
                onTap={() => handlePlayerTap(player)}
                onSub={() => {}}
                showSub={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* End Game */}
      <button
        onClick={handleEndGame}
        className="w-full py-4 rounded-2xl text-white text-lg font-bold shadow-sm active:scale-95 transition-transform mt-1"
        style={{ backgroundColor: '#002B5C' }}
      >
        End Game
      </button>
    </div>
  );
}
