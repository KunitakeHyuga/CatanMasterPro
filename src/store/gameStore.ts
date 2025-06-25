import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Player, 
  GameSession, 
  PlayerColor, 
  ResourceType, 
  SavedBoard, 
  BoardSetup,
  GamePlayer,
  DevelopmentCard,
  DevelopmentCardDeck,
  DevelopmentCardType,
  VictoryPointCardType,
  DiceRoll,
  ResourceCount
} from '../models/types';

interface GameState {
  players: Player[];
  games: GameSession[];
  savedBoards: SavedBoard[];
  currentGame: GameSession | null;
  diceHistory: DiceRoll[];
  lastRoll: DiceRoll | null;
  
  // プレイヤー関連の状態を整理するための区分
  addPlayer: (name: string, color: PlayerColor) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  
  // ゲームデータを扱う関数群
  addGame: (game: Omit<GameSession, 'id'>) => void;
  updateGame: (id: string, updates: Partial<GameSession>) => void;
  removeGame: (id: string) => void;
  startNewGame: (players: GamePlayer[], boardSetup: BoardSetup) => string;
  endGame: (gameId: string, winnerId: string) => void;
  
  // 進行中ゲームの状態操作用
  setCurrentGame: (gameId: string) => void;
  updateCurrentGame: (updates: Partial<GameSession>) => void;
  nextTurn: () => void;
  
  // 発展カード処理に関する関数
  drawDevelopmentCard: (playerId: string) => DevelopmentCard | null;
  playDevelopmentCard: (playerId: string, cardId: string) => void;
  updateDevelopmentCardDeck: (deck: DevelopmentCardDeck) => void;
  updatePlayerDevelopmentCards: (playerId: string, cards: DevelopmentCard[]) => void;
  
  // サイコロ結果の管理
  rollDice: () => DiceRoll;
  
  // 資源の増減を反映させる
  updatePlayerResources: (playerId: string, resources: Partial<ResourceCount>) => void;
  
  // 建設関連の更新処理
  addBuilding: (playerId: string, type: 'settlement' | 'city', position: any) => void;
  addRoad: (playerId: string, position: any) => void;
  
  // 自動計算のトリガー
  calculatePlayerPoints: (playerId: string) => number;
  updateLongestRoad: () => void;
  updateLargestArmy: () => void;
  
  // ボード設定の保存用
  saveBoard: (board: BoardSetup & { name: string }) => void;
  updateSavedBoard: (id: string, updates: Partial<SavedBoard>) => void;
  removeSavedBoard: (id: string) => void;
  
  // 補助的な取得処理
  getPlayerById: (id: string) => Player | undefined;
  getPlayerStats: (id: string) => {
    winRate: number;
    avgScore: number;
    favoriteResource: ResourceType | null;
    avgRank: number;
  };
}

// 発展カードデッキの雛形を作成
const createVictoryPointCards = (): DevelopmentCard[] => [
  { id: uuidv4(), type: 'victory_point', name: 'University', isPlayed: false, victoryPointValue: 1, victoryPointType: 'university' },
  { id: uuidv4(), type: 'victory_point', name: 'Library', isPlayed: false, victoryPointValue: 1, victoryPointType: 'library' },
  { id: uuidv4(), type: 'victory_point', name: 'Parliament', isPlayed: false, victoryPointValue: 1, victoryPointType: 'parliament' },
  { id: uuidv4(), type: 'victory_point', name: 'Market', isPlayed: false, victoryPointValue: 1, victoryPointType: 'market' },
  { id: uuidv4(), type: 'victory_point', name: 'Church', isPlayed: false, victoryPointValue: 1, victoryPointType: 'church' },
];

const createInitialDeck = (): DevelopmentCardDeck => ({
  knights: 14,
  victoryPoints: createVictoryPointCards(),
  roadBuilding: 2,
  yearOfPlenty: 2,
  monopoly: 2,
  totalRemaining: 25
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      games: [],
      savedBoards: [],
      currentGame: null,
      diceHistory: [],
      lastRoll: null,

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

      startNewGame: (players, boardSetup) => {
        const gameId = uuidv4();
        const newGame: GameSession = {
          id: gameId,
          date: new Date().toISOString(),
          duration: 0,
          players: players.map(p => ({
            ...p,
            resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
            developmentCards: [],
            knightsPlayed: 0,
            longestRoadLength: 0,
            hasLongestRoad: false,
            hasLargestArmy: false,
            totalPoints: 0
          })),
          winner: '',
          boardSetup,
          gameDetails: { notes: '', tags: [] },
          currentTurn: 1,
          currentPlayer: players[0]?.id || '',
          developmentCardDeck: createInitialDeck(),
          isActive: true,
          turnHistory: []
        };

        set((state) => ({
          games: [...state.games, newGame],
          currentGame: newGame
        }));

        return gameId;
      },

      endGame: (gameId, winnerId) => {
        set((state) => ({
          games: state.games.map(game => 
            game.id === gameId 
              ? { ...game, winner: winnerId, isActive: false }
              : game
          ),
          currentGame: state.currentGame?.id === gameId 
            ? { ...state.currentGame, winner: winnerId, isActive: false }
            : state.currentGame
        }));
      },

      setCurrentGame: (gameId) => {
        const game = get().games.find(g => g.id === gameId);
        if (game) {
          set({ currentGame: game });
        }
      },

      updateCurrentGame: (updates) => {
        set((state) => {
          if (!state.currentGame) return state;
          
          const updatedGame = { ...state.currentGame, ...updates };
          return {
            currentGame: updatedGame,
            games: state.games.map(game => 
              game.id === updatedGame.id ? updatedGame : game
            )
          };
        });
      },

      nextTurn: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        const currentPlayerIndex = currentGame.players.findIndex(
          p => p.id === currentGame.currentPlayer
        );
        const nextPlayerIndex = (currentPlayerIndex + 1) % currentGame.players.length;
        const nextPlayer = currentGame.players[nextPlayerIndex];

        get().updateCurrentGame({
          currentTurn: currentPlayerIndex === currentGame.players.length - 1 
            ? currentGame.currentTurn + 1 
            : currentGame.currentTurn,
          currentPlayer: nextPlayer.id
        });
      },

      rollDice: () => {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const roll: DiceRoll = {
          die1,
          die2,
          total: die1 + die2,
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          diceHistory: [...state.diceHistory, roll],
          lastRoll: roll
        }));

        return roll;
      },

      drawDevelopmentCard: (playerId) => {
        const { currentGame } = get();
        if (!currentGame || currentGame.developmentCardDeck.totalRemaining === 0) {
          return null;
        }

        const deck = currentGame.developmentCardDeck;
        const cardTypes: DevelopmentCardType[] = [];
        
        // 残っているカード種を抽選対象のリストに追加
        for (let i = 0; i < deck.knights; i++) cardTypes.push('knight');
        for (let i = 0; i < deck.roadBuilding; i++) cardTypes.push('road_building');
        for (let i = 0; i < deck.yearOfPlenty; i++) cardTypes.push('year_of_plenty');
        for (let i = 0; i < deck.monopoly; i++) cardTypes.push('monopoly');
        deck.victoryPoints.forEach(() => cardTypes.push('victory_point'));

        if (cardTypes.length === 0) return null;

        // 均等な確率でカードを引くため乱数を利用
        const randomIndex = Math.floor(Math.random() * cardTypes.length);
        const drawnType = cardTypes[randomIndex];

        let drawnCard: DevelopmentCard;

        if (drawnType === 'victory_point') {
          const availableVPCards = deck.victoryPoints.filter(card => !card.isPlayed);
          const vpCard = availableVPCards[Math.floor(Math.random() * availableVPCards.length)];
          drawnCard = { ...vpCard };
        } else {
          drawnCard = {
            id: uuidv4(),
            type: drawnType,
            name: getCardName(drawnType),
            isPlayed: false
          };
        }

        // 引いた結果を反映させるためデッキとプレイヤー情報を更新
        const updatedDeck = { ...deck };
        if (drawnType === 'knight') updatedDeck.knights--;
        else if (drawnType === 'road_building') updatedDeck.roadBuilding--;
        else if (drawnType === 'year_of_plenty') updatedDeck.yearOfPlenty--;
        else if (drawnType === 'monopoly') updatedDeck.monopoly--;
        else if (drawnType === 'victory_point') {
          updatedDeck.victoryPoints = updatedDeck.victoryPoints.filter(card => card.id !== drawnCard.id);
        }
        updatedDeck.totalRemaining--;

        get().updateCurrentGame({
          developmentCardDeck: updatedDeck,
          players: currentGame.players.map(player =>
            player.id === playerId
              ? { ...player, developmentCards: [...player.developmentCards, drawnCard] }
              : player
          )
        });

        return drawnCard;
      },

      playDevelopmentCard: (playerId, cardId) => {
        const { currentGame } = get();
        if (!currentGame) return;

        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? {
                  ...player,
                  developmentCards: player.developmentCards.map(card =>
                    card.id === cardId
                      ? { ...card, isPlayed: true, playedTurn: currentGame.currentTurn }
                      : card
                  ),
                  knightsPlayed: player.developmentCards.find(c => c.id === cardId)?.type === 'knight'
                    ? player.knightsPlayed + 1
                    : player.knightsPlayed
                }
              : player
          )
        });

        // 騎士カード使用後に最大騎士力を再判定
        get().updateLargestArmy();
        
        // 得点が変動したため再計算
        const updatedPoints = get().calculatePlayerPoints(playerId);
        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? { ...player, totalPoints: updatedPoints }
              : player
          )
        });
      },

      updateDevelopmentCardDeck: (deck) => {
        const { currentGame } = get();
        if (!currentGame) return;
        get().updateCurrentGame({ developmentCardDeck: deck });
      },

      updatePlayerDevelopmentCards: (playerId, cards) => {
        const { currentGame } = get();
        if (!currentGame) return;
        
        // 発展カード更新時に騎士の使用枚数も更新
        const playedKnights = cards.filter(c => c.type === 'knight' && c.isPlayed).length;
        
        get().updateCurrentGame({
          players: currentGame.players.map(p =>
            p.id === playerId 
              ? { 
                  ...p, 
                  developmentCards: cards,
                  knightsPlayed: playedKnights
                } 
              : p
          )
        });

        // 最大騎士力と得点を再計算
        get().updateLargestArmy();
        const updatedPoints = get().calculatePlayerPoints(playerId);
        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? { ...player, totalPoints: updatedPoints }
              : player
          )
        });
      },

      calculatePlayerPoints: (playerId) => {
        const { currentGame } = get();
        if (!currentGame) return 0;

        const player = currentGame.players.find(p => p.id === playerId);
        if (!player) return 0;

        let points = 0;
        
        // 建物による得点加算
        points += player.buildings.settlements * 1;
        points += player.buildings.cities * 2;
        
        // 勝利点カードの得点加算
        points += player.developmentCards
          .filter(card => card.type === 'victory_point')
          .length;
        
        // 特殊実績ボーナス
        if (player.hasLongestRoad) points += 2;
        if (player.hasLargestArmy) points += 2;

        return points;
      },

      updateLargestArmy: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        // 使用済み騎士カードが3枚以上のプレイヤーを取得
        const playersWithKnights = currentGame.players
          .map(p => ({
            ...p,
            playedKnights: p.developmentCards.filter(c => c.type === 'knight' && c.isPlayed).length
          }))
          .filter(p => p.playedKnights >= 3)
          .sort((a, b) => b.playedKnights - a.playedKnights);

        const currentLargestArmyPlayer = playersWithKnights[0];
        
        // 同数の場合は現在の保持者が継続
        const hasMultipleWithSameCount = playersWithKnights.length > 1 && 
          playersWithKnights[0].playedKnights === playersWithKnights[1].playedKnights;
        
        get().updateCurrentGame({
          players: currentGame.players.map(player => {
            if (hasMultipleWithSameCount && player.hasLargestArmy) {
              // 同数の場合は現在の保持者が継続
              return player;
            }
            return {
              ...player,
              hasLargestArmy: currentLargestArmyPlayer?.id === player.id
            };
          })
        });
      },

      updateLongestRoad: () => {
        // 最長道路算出処理を入れる予定
        // 現状は仮実装
        const { currentGame } = get();
        if (!currentGame) return;

        // TODO: 実際の最長道路計算を実装する
        // 道路を連結して探索する複雑な処理が必要
      },

      updatePlayerResources: (playerId, resources) => {
        const { currentGame } = get();
        if (!currentGame) return;

        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? { 
                  ...player, 
                  resources: { ...player.resources, ...resources }
                }
              : player
          )
        });
      },

      addBuilding: (playerId, type, position) => {
        const { currentGame } = get();
        if (!currentGame) return;

        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? {
                  ...player,
                  buildings: {
                    ...player.buildings,
                    [type === 'settlement' ? 'settlements' : 'cities']: 
                      player.buildings[type === 'settlement' ? 'settlements' : 'cities'] + 1
                  }
                }
              : player
          ),
          boardSetup: {
            ...currentGame.boardSetup,
            buildings: [...currentGame.boardSetup.buildings, { type, position, playerId }]
          }
        });

        // 建物追加で得点が変化するため再計算
        const updatedPoints = get().calculatePlayerPoints(playerId);
        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? { ...player, totalPoints: updatedPoints }
              : player
          )
        });
      },

      addRoad: (playerId, position) => {
        const { currentGame } = get();
        if (!currentGame) return;

        get().updateCurrentGame({
          players: currentGame.players.map(player =>
            player.id === playerId
              ? {
                  ...player,
                  buildings: {
                    ...player.buildings,
                    roads: player.buildings.roads + 1
                  }
                }
              : player
          ),
          boardSetup: {
            ...currentGame.boardSetup,
            roads: [...currentGame.boardSetup.roads, { position, playerId }]
          }
        });

        // 道路追加後に最長道路判定を更新
        get().updateLongestRoad();
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
          gameDetails: game.gameDetails || { notes: '', tags: [] },
          id: uuidv4(),
        };
        
        set((state) => ({
          games: [...state.games, newGame],
        }));

        // ゲーム追加時に各プレイヤーの統計情報を更新
        const { players } = get();
        game.players.forEach((gamePlayer) => {
          const player = players.find((p) => p.id === gamePlayer.playerId);
          if (player) {
            const isWinner = gamePlayer.playerId === game.winner;
            const playerGames = [...get().games, newGame].filter((g) =>
              g.players.some((p) => p.playerId === player.id)
            );
            
            const gamesPlayed = playerGames.length;
            const wins = playerGames.filter((g) => g.winner === player.id).length;
            const totalScore = playerGames.reduce(
              (sum, g) => sum + g.players.find((p) => p.playerId === player.id)?.score || 0,
              0
            );
            const avgScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;
            const highestScore = Math.max(
              player.stats.highestScore,
              gamePlayer.score
            );

            get().updatePlayer(player.id, {
              stats: {
                gamesPlayed,
                wins,
                avgScore,
                highestScore,
                favoriteResource: player.stats.favoriteResource,
              },
            });
          }
        });

        return newGame.id;
      },

      updateGame: (id, updates) => {
        set((state) => ({
          games: state.games.map((game) =>
            game.id === id
              ? {
                  ...game,
                  ...updates,
                  gameDetails: updates.gameDetails
                    ? updates.gameDetails
                    : game.gameDetails
                }
              : game
          ),
        }));
      },

      removeGame: (id) => {
        set((state) => ({
          games: state.games.filter((game) => game.id !== id),
        }));
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

        // 好みの資源計算は未実装
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
      version: 1,
      merge: (persistedState, currentState) => {
        const state = {
          ...currentState,
          ...(persistedState as GameState),
        } as GameState;

        // 旧形式のデータを新形式へ変換
        state.games = state.games.map(convertGameDetails);
        state.currentGame = state.currentGame
          ? convertGameDetails(state.currentGame)
          : null;

        return state;
      }
    }
  )
);

// 旧形式のゲームデータを新形式に整形
function convertGameDetails(game: any): GameSession {
  if (!game.gameDetails) {
    const { notes = '', tags = [], ...rest } = game;
    return { ...rest, gameDetails: { notes, tags } } as GameSession;
  }
  return game as GameSession;
}

// カード名を取得するための補助関数
function getCardName(type: DevelopmentCardType): string {
  switch (type) {
    case 'knight': return '騎士';
    case 'road_building': return '街道建設';
    case 'year_of_plenty': return '収穫';
    case 'monopoly': return '独占';
    case 'victory_point': return '勝利点';
    default: return 'Unknown';
  }
}