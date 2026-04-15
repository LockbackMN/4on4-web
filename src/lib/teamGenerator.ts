import type { Player, GameSession } from './storage';

// Snake-draft positions map to Team A and Team B
// Indices [0,3,4,7] -> Team A, [1,2,5,6] -> Team B
const TEAM_A_INDICES = new Set([0, 3, 4, 7]);

export function generateTeams(players: Player[]): {
  session: GameSession;
  updatedPlayers: Player[];
} {
  const eligible = players.filter(p => p.isActiveToday && !p.skipNextGame);
  const skipped = players.filter(p => p.isActiveToday && p.skipNextGame);

  if (eligible.length < 8) {
    throw new Error('Need at least 8 eligible players to generate teams');
  }

  // Sort: prioritized first, then fewest games, then least recently activated
  const sorted = [...eligible].sort((a, b) => {
    if (a.prioritizeNextGame !== b.prioritizeNextGame) {
      return a.prioritizeNextGame ? -1 : 1;
    }
    if (a.totalGamesPlayed !== b.totalGamesPlayed) {
      return a.totalGamesPlayed - b.totalGamesPlayed;
    }
    return a.lastActivatedAt - b.lastActivatedAt;
  });

  const playing = sorted.slice(0, 8);
  const overflow = sorted.slice(8);
  const sittingOut = [...overflow, ...skipped];

  const teamA: Player[] = [];
  const teamB: Player[] = [];

  const now = Date.now();
  const updatedPlaying = playing.map((p, i) => ({
    ...p,
    lastActivatedAt: now,
    prioritizeNextGame: false,
  }));

  updatedPlaying.forEach((p, i) => {
    if (TEAM_A_INDICES.has(i)) {
      teamA.push(p);
    } else {
      teamB.push(p);
    }
  });

  // Clear skipNextGame for skipped players, set their priority for next round
  const updatedSkipped = skipped.map(p => ({
    ...p,
    skipNextGame: false,
    prioritizeNextGame: true,
  }));

  // Merge all updated players back
  const playingIds = new Set(updatedPlaying.map(p => p.id));
  const skippedIds = new Set(updatedSkipped.map(p => p.id));

  const updatedPlayers = players.map(p => {
    if (playingIds.has(p.id)) return updatedPlaying.find(u => u.id === p.id)!;
    if (skippedIds.has(p.id)) return updatedSkipped.find(u => u.id === p.id)!;
    return p;
  });

  return {
    session: { teamA, teamB, sittingOut },
    updatedPlayers,
  };
}
