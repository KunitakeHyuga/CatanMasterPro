import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { DiceRoll } from '../../models/types';
import { Dices } from 'lucide-react';

interface DiceRollerProps {
  onRoll: () => void;
  lastRoll: DiceRoll | null;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, lastRoll }) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = async () => {
    setIsRolling(true);
    
    // Add rolling animation delay
    setTimeout(() => {
      onRoll();
      setIsRolling(false);
    }, 1000);
  };

  const getDiceDisplay = (value: number) => {
    const dots = {
      1: '⚀',
      2: '⚁', 
      3: '⚂',
      4: '⚃',
      5: '⚄',
      6: '⚅'
    };
    return dots[value as keyof typeof dots] || '?';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dices size={20} className="mr-2" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          {/* Dice Display */}
          <div className="flex justify-center items-center space-x-4">
            <div className={`text-6xl transition-transform duration-300 ${isRolling ? 'animate-spin' : ''}`}>
              {lastRoll ? getDiceDisplay(lastRoll.die1) : '⚀'}
            </div>
            <div className="text-2xl text-gray-400">+</div>
            <div className={`text-6xl transition-transform duration-300 ${isRolling ? 'animate-spin' : ''}`}>
              {lastRoll ? getDiceDisplay(lastRoll.die2) : '⚀'}
            </div>
          </div>

          {/* Total */}
          {lastRoll && (
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                Total: {lastRoll.total}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(lastRoll.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Roll Button */}
          <Button
            onClick={handleRoll}
            disabled={isRolling}
            isLoading={isRolling}
            size="lg"
            className="w-full"
            icon={<Dices size={20} />}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>

          {/* Special Roll Messages */}
          {lastRoll && (
            <div className="mt-4">
              {lastRoll.total === 7 && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">🔴 Robber Activated!</p>
                  <p className="text-red-600 text-sm">Players with 8+ cards must discard half</p>
                </div>
              )}
              {(lastRoll.total === 6 || lastRoll.total === 8) && (
                <div className="p-3 bg-amber-100 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 font-medium">⭐ High Probability Roll!</p>
                  <p className="text-amber-600 text-sm">Common resource production</p>
                </div>
              )}
              {(lastRoll.total === 2 || lastRoll.total === 12) && (
                <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">🎯 Rare Roll!</p>
                  <p className="text-blue-600 text-sm">Low probability event</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};