import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  GamePlayer,
  DevelopmentCard,
  DevelopmentCardType,
  PlayerColor,
  Player
} from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { PlayerSelector } from './PlayerSelector';
import { Scroll, Sword, Trophy, Route, Coins, Building, Plus, Minus, Shield, Crown, UserPlus } from 'lucide-react';

interface DevelopmentCardTableEditorProps {
  players: GamePlayer[];
  onChange?: (players: GamePlayer[]) => void;
  showAddPlayer?: boolean;
}

export const DevelopmentCardTableEditor: React.FC<DevelopmentCardTableEditorProps> = ({
  players,
  onChange,
  showAddPlayer = false
}) => {
  const { updatePlayerDevelopmentCards } = useGameStore();

  const cardTypes: {
    type: DevelopmentCardType;
    label: string;
    icon: JSX.Element;
    color: string;
  }[] = [
    { type: 'knight', label: '騎士', icon: <Sword size={14} />, color: 'text-red-600' },
    { type: 'victory_point', label: '勝利点', icon: <Trophy size={14} />, color: 'text-amber-600' },
    { type: 'road_building', label: '道路建設', icon: <Route size={14} />, color: 'text-blue-600' },
    { type: 'year_of_plenty', label: '豊作', icon: <Coins size={14} />, color: 'text-green-600' },
    { type: 'monopoly', label: '独占', icon: <Building size={14} />, color: 'text-purple-600' }
  ];

  // 追加可能な色の一覧
  const playerColors: PlayerColor[] = ['red', 'blue', 'white', 'orange', 'green', 'brown'];

  // プレイヤー選択ダイアログ表示状態
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);

  // プレイヤーのカード枚数を取得
  const getCardCount = (player: GamePlayer, type: DevelopmentCardType): number => {
    const cards = player.developmentCards ?? [];
    return cards.filter(card => card.type === type).length;
  };

  // 使用済み騎士カードの枚数を取得
  const getPlayedKnights = (player: GamePlayer): number => {
    const cards = player.developmentCards ?? [];
    return cards.filter(card => card.type === 'knight' && card.isPlayed).length;
  };

  // カードを追加
  const applyChanges = (playerId: string, cards: DevelopmentCard[]) => {
    // ゲーム開始前でも反映できるようローカル状態も更新する
    updatePlayerDevelopmentCards(playerId, cards);
    if (onChange) {
      onChange(
        players.map(p =>
          p.id === playerId ? { ...p, developmentCards: cards } : p
        )
      );
    }
  };

  const addCard = (playerId: string, type: DevelopmentCardType) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCard: DevelopmentCard = {
      id: crypto.randomUUID(),
      type,
      name: cardTypes.find(ct => ct.type === type)?.label || type,
      isPlayed: false,
      victoryPointValue: type === 'victory_point' ? 1 : undefined
    };

    const updatedCards = [...(player.developmentCards ?? []), newCard];
    applyChanges(playerId, updatedCards);
  };

  // カードを削除
  const removeCard = (playerId: string, type: DevelopmentCardType) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const cards = [...(player.developmentCards ?? [])];
    const lastIndex = cards.map(c => c.type).lastIndexOf(type);
    if (lastIndex !== -1) {
      cards.splice(lastIndex, 1);
      applyChanges(playerId, cards);
    }
  };

  // 騎士カードの使用状態を変更
  const updateKnightUsage = (playerId: string, increase: boolean) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const knightCards = (player.developmentCards ?? []).filter(card => card.type === 'knight');
    
    if (increase) {
      const unusedKnight = knightCards.find(card => !card.isPlayed);
      if (unusedKnight) {
        const updatedCards = (player.developmentCards ?? []).map(card =>
          card.id === unusedKnight.id ? { ...card, isPlayed: true } : card
        );
        applyChanges(playerId, updatedCards);
      }
    } else {
      const usedKnight = knightCards.find(card => card.isPlayed);
      if (usedKnight) {
        const updatedCards = (player.developmentCards ?? []).map(card =>
          card.id === usedKnight.id ? { ...card, isPlayed: false } : card
        );
        applyChanges(playerId, updatedCards);
      }
    }
  };

  // プレイヤー選択後の追加処理
  const handlePlayerSelect = (player: Player) => {
    if (!onChange) return;

    const availableColors = playerColors.filter(
      color => !players.some(p => p.color === color)
    );

    const newPlayer: GamePlayer = {
      id: crypto.randomUUID(),
      playerId: player.id,
      name: player.name,
      color: availableColors[0] || 'red',
      score: 0,
      rank: players.length + 1,
      resourceProduction: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      buildings: { roads: 0, settlements: 0, cities: 0, devCards: 0 },
      resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      developmentCards: [],
      knightsPlayed: 0,
      longestRoadLength: 0,
      hasLongestRoad: false,
      hasLargestArmy: false,
      totalPoints: 0
    };

    onChange([...players, newPlayer]);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between relative">
        <CardTitle className="flex items-center">
          <Scroll size={20} className="mr-2" />
          プレイヤー管理
        </CardTitle>
        {showAddPlayer && onChange && (
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowPlayerSelector(prev => !prev)}
              icon={<UserPlus size={16} />}
            >
              Add Player
            </Button>
            {showPlayerSelector && (
              <PlayerSelector
                onSelect={handlePlayerSelect}
                selectedIds={players.map(p => p.playerId)}
                onClose={() => setShowPlayerSelector(false)}
              />
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 font-medium text-gray-700 min-w-[120px]">
                  プレイヤー
                </th>
                {cardTypes.map(cardType => (
                  <th key={cardType.type} className="text-center p-3 font-medium text-gray-700 min-w-[100px]">
                    <div className="flex flex-col items-center space-y-1">
                      <div className={`flex items-center ${cardType.color}`}>
                        {cardType.icon}
                        <span className="ml-1 text-xs">{cardType.label}</span>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 font-medium text-gray-700 min-w-[100px]">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center text-red-600">
                      <Sword size={14} />
                      <span className="ml-1 text-xs">使用済み</span>
                    </div>
                  </div>
                </th>
                <th className="text-center p-3 font-medium text-gray-700 min-w-[100px]">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center text-emerald-600">
                      <Trophy size={14} />
                      <span className="ml-1 text-xs">現在得点</span>
                    </div>
                  </div>
                </th>
                <th className="text-center p-3 font-medium text-gray-700 min-w-[120px]">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center text-blue-600">
                      <Shield size={14} />
                      <span className="ml-1 text-xs">特殊実績</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, playerIndex) => {
                const playedKnights = getPlayedKnights(player);
                const totalKnights = getCardCount(player, 'knight');
                const victoryPoints = getCardCount(player, 'victory_point');
                
                return (
                  <tr key={player.id} className={`border-b border-gray-100 ${playerIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    {/* プレイヤー名 */}
                    <td className="p-3">
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{player.name}</span>
                      </div>
                    </td>

                    {/* 各カード種類の枚数 */}
                    {cardTypes.map(cardType => {
                      const count = getCardCount(player, cardType.type);
                      return (
                        <td key={cardType.type} className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCard(player.id, cardType.type)}
                              disabled={count === 0}
                              icon={<Minus size={12} />}
                              className="h-6 w-6 p-0"
                            />
                            <span className="w-6 text-center font-medium text-sm">
                              {count}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => addCard(player.id, cardType.type)}
                              icon={<Plus size={12} />}
                              className="h-6 w-6 p-0"
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* 使用済み騎士 */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => updateKnightUsage(player.id, false)}
                          disabled={playedKnights === 0}
                          icon={<Minus size={12} />}
                          className="h-6 w-6 p-0"
                        />
                        <span className="w-6 text-center font-medium text-sm text-red-600">
                          {playedKnights}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => updateKnightUsage(player.id, true)}
                          disabled={playedKnights >= totalKnights}
                          icon={<Plus size={12} />}
                          className="h-6 w-6 p-0"
                        />
                      </div>
                      {playedKnights >= 3 && (
                        <div className="text-xs text-red-600 mt-1">
                          最大騎士力候補
                        </div>
                      )}
                    </td>

                    {/* 現在得点 */}
                    <td className="p-3 text-center">
                      <div className="text-lg font-bold text-emerald-600">
                        {player.totalPoints}
                      </div>
                      {victoryPoints > 0 && (
                        <div className="text-xs text-amber-600">
                          +{victoryPoints} VP
                        </div>
                      )}
                    </td>

                    {/* 特殊実績 */}
                    <td className="p-3 text-center">
                      <div className="space-y-1">
                        {player.hasLargestArmy && (
                          <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            <Shield size={10} className="mr-1" />
                            最大騎士力
                          </div>
                        )}
                        {player.hasLongestRoad && (
                          <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            <Route size={10} className="mr-1" />
                            最長道路
                          </div>
                        )}
                        {!player.hasLargestArmy && !player.hasLongestRoad && (
                          <span className="text-xs text-gray-400">なし</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 合計情報 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">総発展カード</div>
              <div className="font-bold text-lg">
                {players.reduce((sum, p) => sum + (p.developmentCards ?? []).length, 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">総騎士カード</div>
              <div className="font-bold text-lg text-red-600">
                {players.reduce((sum, p) => sum + getCardCount(p, 'knight'), 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">使用済み騎士</div>
              <div className="font-bold text-lg text-red-600">
                {players.reduce((sum, p) => sum + getPlayedKnights(p), 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">勝利点カード</div>
              <div className="font-bold text-lg text-amber-600">
                {players.reduce((sum, p) => sum + getCardCount(p, 'victory_point'), 0)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};