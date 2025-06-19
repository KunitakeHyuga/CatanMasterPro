// Core data models for the Catan Complete Management System

export type ResourceType = 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore' | 'desert' | 'ocean';
export type HarborType =
  | 'wood'
  | 'brick'
  | 'sheep'
  | 'wheat'
  | 'ore'
  | 'any'
  | 'none';
export type PlayerColor = 'red' | 'blue' | 'white' | 'orange' | 'green' | 'brown';

export type DevelopmentCardType =
  | 'knight'
  | 'victory_point'
  | 'road_building'
  | 'year_of_plenty'
  | 'monopoly';

// ゲーム全体での発展カード枚数上限
export const DEVELOPMENT_CARD_LIMITS: Record<DevelopmentCardType, number> = {
  knight: 14,
  victory_point: 5,
  road_building: 2,
  year_of_plenty: 2,
  monopoly: 2
};

// 上記枚数の合計値（基本セットでは25枚）
export const TOTAL_DEVELOPMENT_CARDS =
  Object.values(DEVELOPMENT_CARD_LIMITS).reduce((a, b) => a + b, 0);

export type VictoryPointCardType = 
  | 'university'
  | 'library'
  | 'parliament'
  | 'market'
  | 'church';

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  stats: PlayerStats;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  avgScore: number;
  highestScore: number;
  favoriteResource: ResourceType | null;
}

export interface ResourceCount {
  wood: number;
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
}

export interface BuildingCount {
  roads: number;
  settlements: number;
  cities: number;
  devCards: number;
}

export interface DevelopmentCard {
  id: string;
  type: DevelopmentCardType;
  name: string;
  isPlayed: boolean;
  victoryPointValue?: number;
  victoryPointType?: VictoryPointCardType;
  playedTurn?: number;
}

export interface GamePlayer {
  id: string;
  playerId: string;
  name: string;
  color: PlayerColor;
  score: number;
  rank: number;
  resourceProduction: ResourceCount;
  buildings: BuildingCount;
  resources: ResourceCount;
  developmentCards: DevelopmentCard[];
  knightsPlayed: number;
  longestRoadLength: number;
  hasLongestRoad: boolean;
  hasLargestArmy: boolean;
  totalPoints: number;
}

export interface Vertex {
  x: number;
  y: number;
}

export interface Edge {
  from: Vertex;
  to: Vertex;
}

export interface Building {
  type: 'settlement' | 'city';
  position: Vertex;
  playerId: string;
}

export interface Road {
  position: Edge;
  playerId: string;
}

export interface HexTile {
  id: string;
  type: ResourceType;
  number?: number; // desert has no number
  position: {
    x: number;
    y: number;
  };
}

export interface Harbor {
  type: HarborType;
  position: {
    x: number;
    y: number;
  };
  edge: Edge;
  /**
   * Side of the edge where the ocean hex lies relative to the edge orientation
   * ("right" means the ocean is to the right when moving from edge.from to edge.to)
   */
  oceanSide: 'left' | 'right';
}

export interface NumberToken {
  position: {
    x: number;
    y: number;
  };
  value: number;
}

export interface BoardSetup {
  hexTiles: HexTile[];
  numberTokens: NumberToken[];
  harbors: Harbor[];
  robberPosition: {x: number, y: number};
  name?: string;
  isTemplate?: boolean;
  buildings: Building[];
  roads: Road[];
}

export interface DevelopmentCardDeck {
  knights: number; // 14 cards
  victoryPoints: DevelopmentCard[]; // 5 cards
  roadBuilding: number; // 2 cards
  yearOfPlenty: number; // 2 cards
  monopoly: number; // 2 cards
  totalRemaining: number;
}

export interface GameSession {
  id: string;
  date: string;
  duration: number; // in minutes
  players: GamePlayer[];
  winner: string; // player ID
  boardSetup: BoardSetup;
  notes: string;
  tags: string[];
  currentTurn: number;
  currentPlayer: string;
  developmentCardDeck: DevelopmentCardDeck;
  isActive: boolean;
  turnHistory: TurnAction[];
}

export interface TurnAction {
  turn: number;
  playerId: string;
  action: string;
  details: any;
  timestamp: string;
}

export interface SavedBoard extends BoardSetup {
  id: string;
  createdAt: string;
}

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  timestamp: string;
}

export interface GameState {
  currentGame: GameSession | null;
  diceHistory: DiceRoll[];
  lastRoll: DiceRoll | null;
}