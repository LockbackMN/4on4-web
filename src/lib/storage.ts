export interface Player {
  id: number;
  name: string;
  isActiveToday: boolean;
  totalGamesPlayed: number;
  skipNextGame: boolean;
  prioritizeNextGame: boolean;
  lastActivatedAt: number;
}

export interface GameSession {
  teamA: Player[];
  teamB: Player[];
  sittingOut: Player[];
}

const STORAGE_KEY = 'players_json';

export function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Player[];
  } catch {
    return [];
  }
}

export function savePlayers(players: Player[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}
