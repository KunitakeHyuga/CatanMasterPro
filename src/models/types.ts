// Core data models for the Catan Master Pro application

export type ResourceType = 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore' | 'desert' | 'ocean';
export type HarborType = ResourceType | 'any' | 'none';
export type PlayerColor = 'red' | 'blue' | 'white' | 'orange' | 'green' | 'brown';

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

export interface GamePlayer {
  id: string;
  playerId: string;
  name: string;
  color: PlayerColor;
  score: number;
  rank: number;
  resourceProduction: ResourceCount;
  buildings: BuildingCount;
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
}

export interface SavedBoard extends BoardSetup {
  id: string;
  createdAt: string;
}