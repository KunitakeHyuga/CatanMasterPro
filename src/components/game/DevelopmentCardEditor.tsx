import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  DevelopmentCardDeck,
  GamePlayer,
  DevelopmentCard,
  DevelopmentCardType
} from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import {
  Sword,
  Trophy,
  Route,
  Coins,
  Building,
  Plus,
  Minus
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DevelopmentCardEditorProps {
  deck: DevelopmentCardDeck;
  players: GamePlayer[];
  onDeckChange: (deck: DevelopmentCardDeck) => void;
  onPlayersChange: (players: GamePlayer[]) => void;
}

export const DevelopmentCardEditor: React.FC<DevelopmentCardEditorProps> = ({
  deck,
  players,
  onDeckChange,
  onPlayersChange
}) => {
  // ストアの状態も更新してフォームと同期させる
  const { updateDevelopmentCardDeck, updatePlayerDevelopmentCards } = useGameStore();

  const cardIcons: Record<DevelopmentCardType, JSX.Element> = {
    knight: <Sword size={16} className="text-red-600" />,
    victory_point: <Trophy size={16} className="text-amber-600" />,
    road_building: <Route size={16} className="text-blue-600" />,
    year_of_plenty: <Coins size={16} className="text-green-600" />,
    monopoly: <Building size={16} className="text-purple-600" />
  };

  // デッキの各枚数を変更した際に総残数も計算し直す
  const handleDeckInput = (
    field: keyof Omit<DevelopmentCardDeck, 'victoryPoints' | 'totalRemaining'>,
    value: number
  ) => {
    const updated = { ...deck, [field]: Math.max(0, value) };
    updated.totalRemaining =
      updated.knights +
      updated.roadBuilding +
      updated.yearOfPlenty +
      updated.monopoly +
      updated.victoryPoints.length;
    onDeckChange(updated);
    updateDevelopmentCardDeck(updated);
  };

  // 勝利点カードは配列で管理されているため数値入力に合わせて生成する
  const handleVictoryPointCount = (value: number) => {
    const count = Math.max(0, value);
    let vpCards = deck.victoryPoints.slice(0, count);
    if (count > deck.victoryPoints.length) {
      for (let i = deck.victoryPoints.length; i < count; i++) {
        vpCards.push({
          id: uuidv4(),
          type: 'victory_point',
          name: 'Victory Point',
          isPlayed: false,
          victoryPointValue: 1
        });
      }
    }
    const updated = { ...deck, victoryPoints: vpCards };
    updated.totalRemaining =
      updated.knights +
      updated.roadBuilding +
      updated.yearOfPlenty +
      updated.monopoly +
      updated.victoryPoints.length;
    onDeckChange(updated);
    updateDevelopmentCardDeck(updated);
  };

  // プレイヤーにカードを追加する処理
  const addCardToPlayer = (playerId: string, type: DevelopmentCardType) => {
    const newCard: DevelopmentCard = {
      id: uuidv4(),
      type,
      name:
        type === 'victory_point'
          ? 'Victory Point'
          : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      isPlayed: false
    };
    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, developmentCards: [...p.developmentCards, newCard] } : p
    );
    onPlayersChange(updatedPlayers);
    const target = updatedPlayers.find(p => p.id === playerId)!;
    updatePlayerDevelopmentCards(playerId, target.developmentCards);
  };

  // カード削除
  const removePlayerCard = (playerId: string, cardId: string) => {
    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, developmentCards: p.developmentCards.filter(c => c.id !== cardId) } : p
    );
    onPlayersChange(updatedPlayers);
    const target = updatedPlayers.find(p => p.id === playerId)!;
    updatePlayerDevelopmentCards(playerId, target.developmentCards);
  };

  // 使用済み切り替え
  const togglePlayed = (playerId: string, cardId: string) => {
    const updatedPlayers = players.map(p =>
      p.id === playerId
        ? {
            ...p,
            developmentCards: p.developmentCards.map(c =>
              c.id === cardId ? { ...c, isPlayed: !c.isPlayed } : c
            )
          }
        : p
    );
    onPlayersChange(updatedPlayers);
    const target = updatedPlayers.find(p => p.id === playerId)!;
    updatePlayerDevelopmentCards(playerId, target.developmentCards);
  };

  const cardTypeOptions: { value: DevelopmentCardType; label: string }[] = [
    { value: 'knight', label: 'Knight' },
    { value: 'victory_point', label: 'Victory Point' },
    { value: 'road_building', label: 'Road Building' },
    { value: 'year_of_plenty', label: 'Year of Plenty' },
    { value: 'monopoly', label: 'Monopoly' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Development Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            {(['knights', 'roadBuilding', 'yearOfPlenty', 'monopoly'] as const).map(field => (
              <label key={field} className="flex items-center space-x-2 text-sm">
                {cardIcons[
                  field === 'knights'
                    ? 'knight'
                    : field === 'roadBuilding'
                    ? 'road_building'
                    : field === 'yearOfPlenty'
                    ? 'year_of_plenty'
                    : 'monopoly'
                ]}
                <span className="w-20 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="number"
                  min={0}
                  value={deck[field]}
                  onChange={e => handleDeckInput(field, Number(e.target.value))}
                  className="w-16 border border-gray-300 rounded p-1 text-xs"
                />
              </label>
            ))}
            <label className="flex items-center space-x-2 text-sm">
              {cardIcons['victory_point']}
              <span className="w-20">Victory</span>
              <input
                type="number"
                min={0}
                value={deck.victoryPoints.length}
                onChange={e => handleVictoryPointCount(Number(e.target.value))}
                className="w-16 border border-gray-300 rounded p-1 text-xs"
              />
            </label>
          </div>
          <div className="text-xs text-gray-600">Remaining: {deck.totalRemaining}</div>
        </div>

        <div className="space-y-3">
          {players.map(player => (
            <div key={player.id} className="border rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: player.color }} />
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
                <select
                  className="border border-gray-300 rounded text-xs p-1"
                  onChange={e => {
                    const type = e.target.value as DevelopmentCardType;
                    if (type) {
                      addCardToPlayer(player.id, type);
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
              </div>
              {player.developmentCards.length > 0 && (
                <div className="space-y-1 text-xs">
                  {player.developmentCards.map(card => (
                    <div key={card.id} className="flex items-center justify-between border rounded px-2 py-1">
                      <div className="flex items-center space-x-2">
                        {cardIcons[card.type]}
                        <span>{card.name}</span>
                        {card.isPlayed && <span className="text-gray-500">(used)</span>}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePlayed(player.id, card.id)}
                          icon={card.isPlayed ? <Minus size={12} /> : <Plus size={12} />}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removePlayerCard(player.id, card.id)}
                          icon={<Minus size={12} />}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
