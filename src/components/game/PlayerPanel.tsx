import React from 'react';
import { GamePlayer } from '../../models/types';
import {
  Trophy,
  Home,
  Building,
  Route,
  Sword,
  Crown,
  Shield,
  Scroll
} from 'lucide-react';
import { getCardCount, getPlayedKnights } from '../../utils/developmentCardUtils';

interface PlayerPanelProps {
  player: GamePlayer;
  isCurrentPlayer: boolean;
  rank: number;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ 
  player, 
  isCurrentPlayer, 
  rank 
}) => {
  const getResourceIcon = (resource: string) => {
    const icons = {
      wood: '🌲',
      brick: '🧱', 
      sheep: '🐑',
      wheat: '🌾',
      ore: '⛰️'
    };
    return icons[resource as keyof typeof icons] || '❓';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // ユーティリティを利用してカード枚数を取得
  const cardCounts = {
    knight: getCardCount(player, 'knight'),
    victory_point: getCardCount(player, 'victory_point'),
    road_building: getCardCount(player, 'road_building'),
    year_of_plenty: getCardCount(player, 'year_of_plenty'),
    monopoly: getCardCount(player, 'monopoly'),
  };

  const playedKnights = getPlayedKnights(player);

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isCurrentPlayer 
        ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
        : 'border-gray-200 bg-white'
    }`}>
      {/* Player Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div 
            className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: player.color }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{player.name}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">{getRankIcon(rank)}</span>
              {isCurrentPlayer && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                  Current Turn
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Total Points */}
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">
            {player.totalPoints}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {/* Resources */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 mb-1">Resources</div>
        <div className="flex justify-between text-sm">
          {Object.entries(player.resources).map(([resource, count]) => (
            <div key={resource} className="text-center">
              <div className="text-lg">{getResourceIcon(resource)}</div>
              <div className="font-medium">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Buildings */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 mb-1">Buildings</div>
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <Route size={14} className="mr-1 text-gray-600" />
            <span>{player.buildings.roads}</span>
          </div>
          <div className="flex items-center">
            <Home size={14} className="mr-1 text-gray-600" />
            <span>{player.buildings.settlements}</span>
          </div>
          <div className="flex items-center">
            <Building size={14} className="mr-1 text-gray-600" />
            <span>{player.buildings.cities}</span>
          </div>
        </div>
      </div>

      {/* Development Cards */}
      <div className="mb-3">
        <div className="text-xs font-medium text-gray-500 mb-1">Development Cards</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Total Cards:</span>
            <span className="font-medium">{player.developmentCards.length}</span>
          </div>
          
          {/* 勝利点カード */}
          {cardCounts.victory_point > 0 && (
            <div className="flex justify-between text-xs">
              <span className="flex items-center text-amber-600">
                <Trophy size={12} className="mr-1" />
                Victory Points:
              </span>
              <span className="font-medium text-amber-600">
                {cardCounts.victory_point} (+{cardCounts.victory_point}pts)
              </span>
            </div>
          )}
          
          {/* 騎士カード */}
          {cardCounts.knight > 0 && (
            <div className="flex justify-between text-xs">
              <span className="flex items-center text-red-600">
                <Sword size={12} className="mr-1" />
                Knights:
              </span>
              <span className="font-medium text-red-600">
                {cardCounts.knight} ({playedKnights} used)
              </span>
            </div>
          )}
          
          {/* その他のカード */}
          {(cardCounts.road_building + cardCounts.year_of_plenty + cardCounts.monopoly) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="flex items-center text-blue-600">
                <Scroll size={12} className="mr-1" />
                Other Cards:
              </span>
              <span className="font-medium text-blue-600">
                {cardCounts.road_building + cardCounts.year_of_plenty + cardCounts.monopoly}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Special Achievements */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          {player.hasLargestArmy && (
            <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              <Shield size={12} className="mr-1" />
              <span>Largest Army (+2pts)</span>
            </div>
          )}
          {player.hasLongestRoad && (
            <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              <Route size={12} className="mr-1" />
              <span>Longest Road (+2pts)</span>
            </div>
          )}
        </div>

        {/* 最大騎士力候補の表示 */}
        {playedKnights >= 3 && !player.hasLargestArmy && (
          <div className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
            <Sword size={12} className="mr-1" />
            <span>Army Candidate ({playedKnights} knights)</span>
          </div>
        )}

        {/* Victory Condition */}
        {player.totalPoints >= 10 && (
          <div className="mt-2 p-2 bg-amber-100 border border-amber-200 rounded-lg text-center">
            <div className="flex items-center justify-center text-amber-800">
              <Trophy size={16} className="mr-1" />
              <span className="font-bold">WINNER!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};