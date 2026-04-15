import { useState } from 'react';
import { useLeagueStore } from '../store/useLeagueStore';

export function PlayersTab() {
  const { players, addPlayer, removePlayer, renamePlayer, toggleActiveToday } = useLeagueStore();
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const activeCount = players.filter(p => p.isActiveToday).length;

  const filtered = [...players]
    .filter(p => p.name.toLowerCase().includes(input.toLowerCase()))
    .sort((a, b) => b.lastActivatedAt - a.lastActivatedAt);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (players.length >= 16) return;
    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return;
    addPlayer(trimmed);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  function startEdit(id: number, name: string) {
    setEditingId(id);
    setEditName(name);
  }

  function confirmEdit(id: number) {
    if (editName.trim()) renamePlayer(id, editName.trim());
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-3 p-4 pb-2">
      {/* Stat card */}
      <div className="text-white rounded-2xl p-4 flex justify-between items-center shadow-sm" style={{ backgroundColor: '#002B5C' }}>
        <div>
          <p className="text-2xl font-bold">{activeCount}</p>
          <p className="text-sm opacity-90">active today</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{players.length}<span className="text-base font-normal opacity-75">/16</span></p>
          <p className="text-sm opacity-90">total players</p>
        </div>
      </div>

      {/* Search / Add input */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#002B5C' } as React.CSSProperties}
          placeholder="Search or add player..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || players.length >= 16}
          className="rounded-xl text-white font-bold px-4 py-3 disabled:opacity-40 active:scale-95 transition-transform"
          style={{ backgroundColor: '#002B5C' }}
        >
          Add
        </button>
      </div>

      {players.length >= 16 && (
        <p className="text-sm text-red-500 text-center">Maximum 16 players reached</p>
      )}

      {/* Player list */}
      <ul className="flex flex-col gap-2">
        {filtered.map(player => (
          <li key={player.id} className="bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3">
            {/* Active toggle */}
            <button
              onClick={() => toggleActiveToday(player.id)}
              className="w-12 h-7 rounded-full transition-colors flex-shrink-0 relative"
              style={{ backgroundColor: player.isActiveToday ? '#8CCE26' : '#D1D5DB' }}
              aria-label={`Toggle ${player.name} active`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  player.isActiveToday ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>

            {/* Name / edit field */}
            <div className="flex-1 min-w-0">
              {editingId === player.id ? (
                <input
                  autoFocus
                  className="w-full border-b-2 text-base outline-none bg-transparent py-0.5"
                  style={{ borderColor: '#002B5C' }}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') confirmEdit(player.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  onBlur={() => confirmEdit(player.id)}
                />
              ) : (
                <p className="text-base font-medium truncate">{player.name}</p>
              )}
              <p className="text-xs text-gray-400">{player.totalGamesPlayed} games</p>
            </div>

            {/* Edit / Delete buttons */}
            {editingId === player.id ? (
              <button onClick={cancelEdit} className="text-gray-400 text-sm px-2 py-1">
                Cancel
              </button>
            ) : (
              <>
                <button
                  onClick={() => startEdit(player.id, player.name)}
                  className="text-gray-400 p-2 rounded-lg active:scale-90 transition-transform"
                  style={{ color: '#9EA2A2' }}
                  aria-label="Edit name"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="text-gray-400 p-2 rounded-lg active:scale-90 transition-transform"
                  style={{ color: '#9EA2A2' }}
                  aria-label="Delete player"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {players.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg">No players yet</p>
          <p className="text-sm">Add players above to get started</p>
        </div>
      )}
    </div>
  );
}
