import React from 'react';
import { GamePlayer } from '../../models/types';
import { 
  Trophy, 
  Home, 
  Building, 
  Route,
  Sword,
  Crown,
  Shield
} from 'lucide-react';

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

      {/* Development Cards & Achievements */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Dev Cards:</span>
          <span className="font-medium">{player.developmentCards.length}</span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Knights:</span>
          <div className="flex items-center">
            <Sword size={12} className="mr-1" />
            <span className="font-medium">{player.knightsPlayed}</span>
          </div>
        </div>

        {/* Special Achievements */}
        <div className="flex space-x-2 mt-2">
          {player.hasLargestArmy && (
            <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
              <Shield size={12} className="mr-1" />
              <span>Largest Army</span>
            </div>
          )}
          {player.hasLongestRoad && (
            <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              <Route size={12} className="mr-1" />
              <span>Longest Road</span>
            </div>
          )}
        </div>

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