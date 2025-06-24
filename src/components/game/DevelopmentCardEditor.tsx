import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  GamePlayer,
  DevelopmentCard,
  DevelopmentCardType
} from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { Scroll, Sword, Trophy, Route, Coins, Building, Plus, Minus } from 'lucide-react';

interface DevelopmentCardEditorProps {
  player: GamePlayer;
  onChange?: (player: GamePlayer) => void;
}

export const DevelopmentCardEditor: React.FC<DevelopmentCardEditorProps> = ({
  player,
  onChange
}) => {
  const { updatePlayerDevelopmentCards } = useGameStore();

  const cardIcons: Record<DevelopmentCardType, JSX.Element> = {
    knight: <Sword size={16} className="text-red-600" />,
    victory_point: <Trophy size={16} className="text-amber-600" />,
    road_building: <Route size={16} className="text-blue-600" />,
    year_of_plenty: <Coins size={16} className="text-green-600" />,
    monopoly: <Building size={16} className="text-purple-600" />
  };

  const cardTypeOptions: { value: DevelopmentCardType; label: string; description: string }[] = [
    { value: 'knight', label: '騎士', description: '盗賊を移動し、他プレイヤーからカードを奪う' },
    { value: 'victory_point', label: '勝利点', description: '1勝利点を獲得' },
    { value: 'road_building', label: '街道建設', description: '道路を2本まで無料で建設' },
    { value: 'year_of_plenty', label: '収穫', description: '好きな資源を2つ獲得' },
    { value: 'monopoly', label: '独占', description: '指定した資源を全プレイヤーから獲得' }
  ];

  // カード種類別の枚数を集計
  const cardCounts = cardTypeOptions.reduce((acc, option) => {
    acc[option.value] = player.developmentCards.filter(card => card.type === option.value).length;
    return acc;
  }, {} as Record<DevelopmentCardType, number>);

  // 使用済み騎士カードの枚数
  const playedKnights = player.developmentCards.filter(
    card => card.type === 'knight' && card.isPlayed
  ).length;

  // カード変更時の共通処理
  const applyChanges = (cards: DevelopmentCard[]) => {
    const updated = { ...player, developmentCards: cards };
    updatePlayerDevelopmentCards(player.id, cards);
    onChange?.(updated);
  };

  // 新しいカードを追加
  const addCard = (type: DevelopmentCardType) => {
    const newCard: DevelopmentCard = {
      id: crypto.randomUUID(),
      type,
      name: cardTypeOptions.find(opt => opt.value === type)?.label || type,
      isPlayed: false,
      victoryPointValue: type === 'victory_point' ? 1 : undefined
    };
    applyChanges([...player.developmentCards, newCard]);
  };

  // カードを削除（最新のものから）
  const removeCard = (type: DevelopmentCardType) => {
    const cards = [...player.developmentCards];
    const lastIndex = cards.map(c => c.type).lastIndexOf(type);
    if (lastIndex !== -1) {
      cards.splice(lastIndex, 1);
      applyChanges(cards);
    }
  };

  // 騎士カードの使用状態を切り替え
  const toggleKnightUsed = (increase: boolean) => {
    const knightCards = player.developmentCards.filter(card => card.type === 'knight');
    if (increase) {
      // 未使用の騎士カードを使用済みにする
      const unusedKnight = knightCards.find(card => !card.isPlayed);
      if (unusedKnight) {
        applyChanges(
          player.developmentCards.map(card =>
            card.id === unusedKnight.id ? { ...card, isPlayed: true } : card
          )
        );
      }
    } else {
      // 使用済みの騎士カードを未使用に戻す
      const usedKnight = knightCards.find(card => card.isPlayed);
      if (usedKnight) {
        applyChanges(
          player.developmentCards.map(card =>
            card.id === usedKnight.id ? { ...card, isPlayed: false } : card
          )
        );
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Scroll size={20} className="mr-2" />
          {player.name} の発展カード
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 各カード種類の枚数表示と増減ボタン */}
        {cardTypeOptions.map(option => (
          <div key={option.value} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {cardIcons[option.value]}
                <div className="ml-2">
                  <span className="font-medium">{option.label}</span>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeCard(option.value)}
                  disabled={cardCounts[option.value] === 0}
                  icon={<Minus size={14} />}
                />
                <span className="w-8 text-center font-medium">
                  {cardCounts[option.value]}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addCard(option.value)}
                  icon={<Plus size={14} />}
                />
              </div>
            </div>

            {/* 騎士カードの場合は使用済み枚数も表示 */}
            {option.value === 'knight' && cardCounts.knight > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">使用済み騎士</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleKnightUsed(false)}
                      disabled={playedKnights === 0}
                      icon={<Minus size={12} />}
                    />
                    <span className="w-8 text-center text-sm font-medium text-red-600">
                      {playedKnights}/{cardCounts.knight}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleKnightUsed(true)}
                      disabled={playedKnights >= cardCounts.knight}
                      icon={<Plus size={12} />}
                    />
                  </div>
                </div>
                
                {/* 最大騎士力の表示 */}
                {playedKnights >= 3 && (
                  <div className="mt-1 text-xs text-red-600 font-medium">
                    🛡️ 最大騎士力候補 ({playedKnights}枚)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* 合計枚数表示 */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">合計発展カード:</span>
            <span className="font-medium">{player.developmentCards.length}枚</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">勝利点カード:</span>
            <span className="font-medium text-amber-600">
              {cardCounts.victory_point}枚 (+{cardCounts.victory_point}点)
            </span>
          </div>
          {playedKnights >= 3 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">最大騎士力:</span>
              <span className="font-medium text-red-600">
                {player.hasLargestArmy ? '獲得中 (+2点)' : '候補'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};