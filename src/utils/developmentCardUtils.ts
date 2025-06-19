import { GamePlayer, DevelopmentCardType } from '../models/types';

// 指定タイプの発展カード枚数を返す
export const getCardCount = (
  player: GamePlayer,
  type: DevelopmentCardType
): number => {
  return player.developmentCards.filter(card => card.type === type).length;
};

// 使用済み騎士カードの枚数を返す
export const getPlayedKnights = (player: GamePlayer): number => {
  return player.developmentCards.filter(
    card => card.type === 'knight' && card.isPlayed
  ).length;
};
