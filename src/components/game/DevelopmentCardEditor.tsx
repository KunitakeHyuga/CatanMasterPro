import React from 'react';
import { Button } from '../ui/Button';
import {
  GamePlayer,
  DevelopmentCard,
  DevelopmentCardType
} from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { Scroll, Sword, Trophy, Route, Coins, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";


interface DevelopmentCardEditorProps {
  player: GamePlayer;
  onChange?: (player: GamePlayer) => void;
}

export const DevelopmentCardEditor: React.FC<DevelopmentCardEditorProps> = ({
  player,
  onChange
}) => {
  // ストアとフォーム状態を同期させるためストア更新関数を取得
  const { updatePlayerDevelopmentCards } = useGameStore();

  const cardIcons: Record<DevelopmentCardType, JSX.Element> = {
    knight: <Sword size={16} className="text-red-600" />,
    victory_point: <Trophy size={16} className="text-amber-600" />,
    road_building: <Route size={16} className="text-blue-600" />,
    year_of_plenty: <Coins size={16} className="text-green-600" />,
    monopoly: <Building size={16} className="text-purple-600" />
  };

  const cardTypeOptions: { value: DevelopmentCardType; label: string }[] = [
    { value: 'knight', label: 'Knight' },
    { value: 'victory_point', label: 'Victory Point' },
    { value: 'road_building', label: 'Road Building' },
    { value: 'year_of_plenty', label: 'Year of Plenty' },
    { value: 'monopoly', label: 'Monopoly' }
  ];

  // カード変更時の共通処理
  const applyChanges = (cards: DevelopmentCard[]) => {
    const updated = { ...player, developmentCards: cards };
    updatePlayerDevelopmentCards(player.id, cards);
    onChange?.(updated);
  };

  // 新しいカードを追加
  const addCard = (type: DevelopmentCardType) => {
    const newCard: DevelopmentCard = {
      id: uuidv4(),
      type,
      name:
        type === 'victory_point'
          ? 'Victory Point'
          : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      isPlayed: false
    };
    applyChanges([...player.developmentCards, newCard]);
  };

  // カード削除処理
  const removeCard = (cardId: string) => {
    applyChanges(player.developmentCards.filter(c => c.id !== cardId));
  };

  // 使用済みフラグ切り替え
  const togglePlayed = (cardId: string) => {
    applyChanges(
      player.developmentCards.map(c =>
        c.id === cardId ? { ...c, isPlayed: !c.isPlayed } : c
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{player.name} Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <select
          className="border border-gray-300 rounded text-xs p-1"
          onChange={e => {
            const type = e.target.value as DevelopmentCardType;
            if (type) {
              addCard(type);
              e.currentTarget.selectedIndex = 0;
            }
          }}
        >
          <option value="">Add Card</option>
          {cardTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {player.developmentCards.length > 0 && (
          <div className="space-y-1 text-xs">
            {player.developmentCards.map(card => (
              <div
                key={card.id}
                className="flex items-center justify-between border rounded px-2 py-1"
              >
                <div className="flex items-center space-x-2">
                  {cardIcons[card.type]}
                  <span>{card.name}</span>
                  {card.isPlayed && (
                    <span className="text-gray-500">(used)</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePlayed(card.id)}
                    icon={card.isPlayed ? <Minus size={12} /> : <Plus size={12} />}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCard(card.id)}
                    icon={<Minus size={12} />}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
