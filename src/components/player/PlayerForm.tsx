import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { PlayerColor, Player } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { Save } from 'lucide-react';
import { playerColors } from '../../constants/playerColors';

interface PlayerFormProps {
  onSave: () => void;
  player?: Player;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onSave, player }) => {
  const { addPlayer, updatePlayer } = useGameStore();
  
  const [name, setName] = useState(player?.name || '');
  const [color, setColor] = useState<PlayerColor>(player?.color || 'red');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (player) {
      updatePlayer(player.id, { name, color });
    } else {
      addPlayer(name, color);
    }
    
    onSave();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{player ? 'Edit Player' : 'Add New Player'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Player Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Player Color
              </label>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {playerColors.map((playerColor) => (
                  <button
                    key={playerColor}
                    type="button"
                    className={`h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                      color === playerColor ? 'ring-2 ring-offset-2 ring-emerald-500' : ''
                    }`}
                    style={{ backgroundColor: playerColor }}
                    onClick={() => setColor(playerColor)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSave}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            icon={<Save size={16} />}
          >
            {player ? 'Update Player' : 'Add Player'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};