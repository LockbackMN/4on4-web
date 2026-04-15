import { create } from 'zustand';
import { loadPlayers, savePlayers, type Player, type GameSession } from '../lib/storage';
import { generateTeams } from '../lib/teamGenerator';

interface LeagueState {
  players: Player[];
  currentGame: GameSession | null;
  nextId: number;

  // Player actions
  addPlayer: (name: string) => void;
  removePlayer: (id: number) => void;
  renamePlayer: (id: number, newName: string) => void;
  toggleActiveToday: (id: number) => void;
  toggleSkipNextGame: (id: number) => void;

  // Game actions
  generateTeams: () => void;
  swapPlayers: (playerA: Player, playerB: Player) => void;
  sitOutPlayer: (player: Player) => void;
  endGame: () => void;
  startNewDay: () => void;
}

function persist(players: Player[]) {
  savePlayers(players);
}

export const useLeagueStore = create<LeagueState>((set, get) => {
  const savedPlayers = loadPlayers();
  const nextId = savedPlayers.length > 0
    ? Math.max(...savedPlayers.map(p => p.id)) + 1
    : 1;

  return {
    players: savedPlayers,
    currentGame: null,
    nextId,

    addPlayer: (name) => {
      const { players, nextId } = get();
      if (players.length >= 16) return;
      const newPlayer: Player = {
        id: nextId,
        name: name.trim(),
        isActiveToday: true,
        totalGamesPlayed: 0,
        skipNextGame: false,
        prioritizeNextGame: false,
        lastActivatedAt: 0,
      };
      const updated = [...players, newPlayer];
      persist(updated);
      set({ players: updated, nextId: nextId + 1 });
    },

    removePlayer: (id) => {
      const updated = get().players.filter(p => p.id !== id);
      persist(updated);
      set({ players: updated });
    },

    renamePlayer: (id, newName) => {
      const updated = get().players.map(p =>
        p.id === id ? { ...p, name: newName.trim() } : p
      );
      persist(updated);
      set({ players: updated });
    },

    toggleActiveToday: (id) => {
      const updated = get().players.map(p =>
        p.id === id ? { ...p, isActiveToday: !p.isActiveToday } : p
      );
      persist(updated);
      set({ players: updated });
    },

    toggleSkipNextGame: (id) => {
      const updated = get().players.map(p =>
        p.id === id ? { ...p, skipNextGame: !p.skipNextGame } : p
      );
      persist(updated);
      set({ players: updated });
    },

    generateTeams: () => {
      const { players } = get();
      const { session, updatedPlayers } = generateTeams(players);
      persist(updatedPlayers);
      set({ players: updatedPlayers, currentGame: session });
    },

    swapPlayers: (playerA, playerB) => {
      const { currentGame } = get();
      if (!currentGame) return;

      type TeamKey = 'teamA' | 'teamB' | 'sittingOut';

      function findTeam(p: Player): TeamKey | null {
        if (currentGame!.teamA.some(x => x.id === p.id)) return 'teamA';
        if (currentGame!.teamB.some(x => x.id === p.id)) return 'teamB';
        if (currentGame!.sittingOut.some(x => x.id === p.id)) return 'sittingOut';
        return null;
      }

      const teamA = findTeam(playerA);
      const teamB = findTeam(playerB);
      if (!teamA || !teamB || teamA === teamB) return;

      const newGame: GameSession = {
        teamA: currentGame.teamA.map(p => {
          if (p.id === playerA.id) return playerB;
          if (p.id === playerB.id) return playerA;
          return p;
        }),
        teamB: currentGame.teamB.map(p => {
          if (p.id === playerA.id) return playerB;
          if (p.id === playerB.id) return playerA;
          return p;
        }),
        sittingOut: currentGame.sittingOut.map(p => {
          if (p.id === playerA.id) return playerB;
          if (p.id === playerB.id) return playerA;
          return p;
        }),
      };

      set({ currentGame: newGame });
    },

    sitOutPlayer: (player) => {
      const { currentGame } = get();
      if (!currentGame || currentGame.sittingOut.length === 0) return;

      const sub = currentGame.sittingOut[0];
      get().swapPlayers(player, sub);
    },

    endGame: () => {
      const { currentGame, players } = get();
      if (!currentGame) return;

      const onCourtIds = new Set([
        ...currentGame.teamA.map(p => p.id),
        ...currentGame.teamB.map(p => p.id),
      ]);

      const updated = players.map(p =>
        onCourtIds.has(p.id)
          ? { ...p, totalGamesPlayed: p.totalGamesPlayed + 1, prioritizeNextGame: false }
          : p
      );

      persist(updated);
      set({ players: updated, currentGame: null });
    },

    startNewDay: () => {
      const updated = get().players.map(p => ({
        ...p,
        isActiveToday: false,
        totalGamesPlayed: 0,
        skipNextGame: false,
        prioritizeNextGame: false,
        lastActivatedAt: 0,
      }));
      persist(updated);
      set({ players: updated, currentGame: null });
    },
  };
});
