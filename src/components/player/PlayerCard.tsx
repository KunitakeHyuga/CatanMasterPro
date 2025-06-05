import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Player } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { Trophy, Target, Star } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
  const { getPlayerStats } = useGameStore();
  const stats = getPlayerStats(player.id);
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: player.color }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
            <p className="text-sm text-gray-500">
              {player.stats.gamesPlayed} games played
            </p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex justify-center text-amber-500">
              <Trophy size={16} />
            </div>
            <div className="mt-1 text-xs text-gray-500">Win Rate</div>
            <div className="font-semibold">{(stats.winRate * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex justify-center text-emerald-500">
              <Target size={16} />
            </div>
            <div className="mt-1 text-xs text-gray-500">Avg Score</div>
            <div className="font-semibold">{stats.avgScore.toFixed(1)}</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex justify-center text-blue-500">
              <Star size={16} />
            </div>
            <div className="mt-1 text-xs text-gray-500">Best Score</div>
            <div className="font-semibold">{player.stats.highestScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};