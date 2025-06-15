import React from 'react';
import { Button } from '../ui/Button';
import { GamePlayer, DevelopmentCard } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { Scroll, Sword, Trophy, Route, Coins, Building } from 'lucide-react';

interface DevelopmentCardEditorProps {
  player: GamePlayer;
}

// テーブル形式でカードを管理しやすくするための編集用コンポーネント
export const DevelopmentCardEditor: React.FC<DevelopmentCardEditorProps> = ({ player }) => {
  const { playDevelopmentCard } = useGameStore();

  // カード種別に応じたアイコンを返す
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'knight':
        return <Sword size={16} className="text-red-600" />;
      case 'victory_point':
        return <Trophy size={16} className="text-amber-600" />;
      case 'road_building':
        return <Route size={16} className="text-blue-600" />;
      case 'year_of_plenty':
        return <Coins size={16} className="text-green-600" />;
      case 'monopoly':
        return <Building size={16} className="text-purple-600" />;
      default:
        return <Scroll size={16} className="text-gray-600" />;
    }
  };

  const handlePlay = (card: DevelopmentCard) => {
    // 勝利点カードはプレイという概念がないため操作しない
    if (card.isPlayed || card.type === 'victory_point') return;
    playDevelopmentCard(player.id, card.id);
  };

  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{player.name}</div>
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-2 py-1">Card</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1" />
          </tr>
        </thead>
        <tbody>
          {player.developmentCards.length === 0 ? (
            <tr>
              <td className="px-2 py-2 text-gray-500 italic" colSpan={3}>
                No cards
              </td>
            </tr>
          ) : (
            player.developmentCards.map((card) => (
              <tr key={card.id} className="border-t">
                <td className="px-2 py-1 flex items-center">
                  {getCardIcon(card.type)}
                  <span className="ml-2">{card.name}</span>
                </td>
                <td className="px-2 py-1">
                  {card.isPlayed ? 'Played' : 'Unused'}
                </td>
                <td className="px-2 py-1 text-right">
                  {!card.isPlayed && card.type !== 'victory_point' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlay(card)}
                      className="text-xs px-2 py-1 h-auto"
                    >
                      Play
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
