import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';
import { GamePlayer, PlayerColor } from '../../models/types';
import { generateDefaultBoard } from '../../utils/board';
import { Plus, Minus, Play, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { playerColors } from '../../constants/playerColors';

export const GameSetup: React.FC = () => {
  const { players, startNewGame } = useGameStore();
  const navigate = useNavigate();
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameType, setGameType] = useState<'standard' | 'seafarers' | 'cities' | 'traders' | 'america'>('standard');

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else if (prev.length < 4) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const handleStartGame = () => {
    if (selectedPlayers.length < 2) {
      alert('Please select at least 2 players');
      return;
    }

    const gamePlayers: GamePlayer[] = selectedPlayers.map((playerId, index) => {
      const player = players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      return {
        id: uuidv4(),
        playerId: player.id,
        name: player.name,
        color: playerColors[index],
        score: 0,
        rank: index + 1,
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
    });

    const boardSetup = generateDefaultBoard(gameType);
    const gameId = startNewGame(gamePlayers, boardSetup);
    
    navigate('/game/active');
  };

  const gameTypes = [
    { key: 'standard', name: 'Standard Catan', description: 'Classic Catan gameplay' },
    { key: 'seafarers', name: 'Seafarers', description: 'Islands and ships expansion' },
    { key: 'cities', name: 'Cities & Knights', description: 'Advanced strategy with knights' },
    { key: 'traders', name: 'Traders & Barbarians', description: 'Trading and barbarian scenarios' },
    { key: 'america', name: 'Catan America', description: 'American frontier theme' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play size={24} className="mr-2 text-emerald-600" />
            Start New Catan Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Game Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameTypes.map(type => (
                <div 
                  key={type.key}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameType === type.key 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setGameType(type.key as any)}
                >
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Player Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Players (2-4 players)
            </label>
            
            {players.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Users size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">No players available</p>
                <Button onClick={() => navigate('/players/new')}>
                  Add Players First
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((player, index) => {
                  const isSelected = selectedPlayers.includes(player.id);
                  const canSelect = !isSelected && selectedPlayers.length < 4;
                  const assignedColor = isSelected 
                    ? playerColors[selectedPlayers.indexOf(player.id)]
                    : playerColors[selectedPlayers.length];

                  return (
                    <div
                      key={player.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : canSelect
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                      onClick={() => canSelect || isSelected ? handlePlayerToggle(player.id) : null}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white font-semibold"
                            style={{ 
                              backgroundColor: isSelected ? assignedColor : player.color 
                            }}
                          >
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{player.name}</h3>
                            <p className="text-sm text-gray-600">
                              {player.stats.gamesPlayed} games played
                            </p>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center">
                            <span className="text-sm text-emerald-600 font-medium mr-2">
                              Player {selectedPlayers.indexOf(player.id) + 1}
                            </span>
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPlayers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Selected {selectedPlayers.length} of 4 players
                </p>
                <div className="flex space-x-2 mt-2">
                  {selectedPlayers.map((playerId, index) => {
                    const player = players.find(p => p.id === playerId);
                    return (
                      <div key={playerId} className="flex items-center text-sm">
                        <div 
                          className="w-4 h-4 rounded-full mr-1"
                          style={{ backgroundColor: playerColors[index] }}
                        />
                        <span>{player?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Start Game Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleStartGame}
              disabled={selectedPlayers.length < 2}
              size="lg"
              icon={<Play size={20} />}
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};