import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../ui/Card';
import { GameSession } from '../../models/types';
import { Clock, Users, Trophy } from 'lucide-react';

interface GameCardProps {
  game: GameSession;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const winner = game.players.find(player => player.playerId === game.winner);
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(new Date(game.date), 'MMM d, yyyy')}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock size={14} className="mr-1" />
              {game.duration} min
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-1" />
            {game.players.length} players
          </div>
          
          {winner && (
            <div className="flex items-center mt-2">
              <Trophy size={16} className="mr-1 text-amber-500" />
              <span className="font-medium">{winner.name}</span>
              <div 
                className="ml-2 h-3 w-3 rounded-full" 
                style={{ backgroundColor: winner.color }}
              />
              <span className="ml-2 text-gray-600">
                {winner.score} points
              </span>
            </div>
          )}
          
          {game.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {game.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};