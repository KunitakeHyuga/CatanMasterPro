// 発展カードデッキ生成に関するユーティリティ
// GameForm と gameStore の重複を解消するためにここへ集約

import { DevelopmentCard, DevelopmentCardDeck } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// 個別の勝利点カードをまとめて生成
export const createVictoryPointCards = (): DevelopmentCard[] => [
  { id: uuidv4(), type: 'victory_point', name: 'University', isPlayed: false, victoryPointValue: 1, victoryPointType: 'university' },
  { id: uuidv4(), type: 'victory_point', name: 'Library', isPlayed: false, victoryPointValue: 1, victoryPointType: 'library' },
  { id: uuidv4(), type: 'victory_point', name: 'Parliament', isPlayed: false, victoryPointValue: 1, victoryPointType: 'parliament' },
  { id: uuidv4(), type: 'victory_point', name: 'Market', isPlayed: false, victoryPointValue: 1, victoryPointType: 'market' },
  { id: uuidv4(), type: 'victory_point', name: 'Church', isPlayed: false, victoryPointValue: 1, victoryPointType: 'church' }
];

// 山札の初期状態を返却
export const createInitialDeck = (): DevelopmentCardDeck => ({
  knights: 14,
  victoryPoints: createVictoryPointCards(),
  roadBuilding: 2,
  yearOfPlenty: 2,
  monopoly: 2,
  totalRemaining: 25
});
