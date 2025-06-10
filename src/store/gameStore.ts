import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Player, GameSession, PlayerColor, ResourceType, SavedBoard, BoardSetup } from '../models/types';

interface GameState {
  players: Player[];
  games: GameSession[];
  savedBoards: SavedBoard[];
  addPlayer: (name: string, color: PlayerColor) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  addGame: (game: Omit<GameSession, 'id'>) => void;
  updateGame: (id: string, updates: Partial<GameSession>) => void;
  removeGame: (id: string) => void;
  saveBoard: (board: BoardSetup & { name: string }) => void;
  updateSavedBoard: (id: string, updates: Partial<SavedBoard>) => void;
  removeSavedBoard: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayerStats: (id: string) => {
    winRate: number;
    avgScore: number;
    favoriteResource: ResourceType | null;
    avgRank: number;
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      const recalcPlayerStats = (games: GameSession[]) => {
        const { players } = get();
        const updatedPlayers = players.map(player => {
          const playerGames = games.filter(g =>
            g.players.some(p => p.playerId === player.id)
          );
          const gamesPlayed = playerGames.length;
          const wins = playerGames.filter(g => g.winner === player.id).length;
          const totalScore = playerGames.reduce(
            (sum, g) =>
              sum + (g.players.find(p => p.playerId === player.id)?.score || 0),
            0
          );
          const highestScore = playerGames.reduce((max, g) => {
            const score = g.players.find(p => p.playerId === player.id)?.score || 0;
            return Math.max(max, score);
          }, 0);
          const avgScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;

          return {
            ...player,
            stats: {
              ...player.stats,
              gamesPlayed,
              wins,
              avgScore,
              highestScore,
            },
          };
        });
        set({ players: updatedPlayers });
      };

      return {
        players: [],
        games: [],
        savedBoards: [],

      addPlayer: (name, color) => {
        const newPlayer: Player = {
          id: uuidv4(),
          name,
          color,
          stats: {
            gamesPlayed: 0,
            wins: 0,
            avgScore: 0,
            highestScore: 0,
            favoriteResource: null,
          },
        };
        set((state) => ({
          players: [...state.players, newPlayer],
        }));
        return newPlayer.id;
      },

      updatePlayer: (id, updates) => {
        set((state) => ({
          players: state.players.map((player) =>
            player.id === id ? { ...player, ...updates } : player
          ),
        }));
      },

      removePlayer: (id) => {
        set((state) => ({
          players: state.players.filter((player) => player.id !== id),
        }));
      },

      saveBoard: (board) => {
        const savedBoard: SavedBoard = {
          ...board,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          isTemplate: true,
        };
        set((state) => ({
          savedBoards: [...state.savedBoards, savedBoard],
        }));
        return savedBoard.id;
      },

      updateSavedBoard: (id, updates) => {
        set((state) => ({
          savedBoards: state.savedBoards.map((board) =>
            board.id === id ? { ...board, ...updates } : board
          ),
        }));
      },

      removeSavedBoard: (id) => {
        set((state) => ({
          savedBoards: state.savedBoards.filter((board) => board.id !== id),
        }));
      },

      addGame: (game) => {
        const newGame = {
          ...game,
          id: uuidv4(),
        };

        set((state) => ({
          games: [...state.games, newGame],
        }));

        recalcPlayerStats([...get().games, newGame]);

        return newGame.id;
      },

      updateGame: (id, updates) => {
        set((state) => ({
          games: state.games.map((game) =>
            game.id === id ? { ...game, ...updates } : game
          ),
        }));
        recalcPlayerStats(get().games);
      },

      removeGame: (id) => {
        set((state) => ({
          games: state.games.filter((game) => game.id !== id),
        }));
        recalcPlayerStats(get().games);
      },

      getPlayerById: (id) => {
        return get().players.find((player) => player.id === id);
      },

      getPlayerStats: (id) => {
        const { games } = get();
        const playerGames = games.filter((game) =>
          game.players.some((p) => p.playerId === id)
        );
        
        const gamesPlayed = playerGames.length;
        if (gamesPlayed === 0) {
          return {
            winRate: 0,
            avgScore: 0,
            favoriteResource: null,
            avgRank: 0,
          };
        }

        const wins = playerGames.filter((game) => game.winner === id).length;
        const winRate = wins / gamesPlayed;
        
        const totalScore = playerGames.reduce(
          (sum, game) => sum + (game.players.find((p) => p.playerId === id)?.score || 0),
          0
        );
        const avgScore = totalScore / gamesPlayed;
        
        const totalRank = playerGames.reduce(
          (sum, game) => sum + (game.players.find((p) => p.playerId === id)?.rank || 0),
          0
        );
        const avgRank = totalRank / gamesPlayed;

        // Placeholder for favorite resource calculation
        // In a real app, we would analyze resource production across games
        const favoriteResource = null;

        return {
          winRate,
          avgScore,
          favoriteResource,
          avgRank,
        };
      },
    }),
    {
      name: 'catan-master-store',
    }
  )
);