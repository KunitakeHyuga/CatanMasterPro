import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Plus, Minus, UserPlus, X, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { GameSession, PlayerColor, ResourceType, HexTile, GamePlayer } from '../../models/types';
import { useGameStore } from '../../store/gameStore';
import { format } from 'date-fns';

const playerColors: PlayerColor[] = ['red', 'blue', 'white', 'orange', 'green', 'brown'];
const resourceTypes: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore', 'desert'];

// Simplified board generation for the MVP
const generateDefaultBoard = (): HexTile[] => {
  // Create a basic hexagonal board with 19 tiles
  const hexes: HexTile[] = [];
  const layout = [3, 4, 5, 4, 3]; // Number of hexes in each row
  
  let hexId = 0;
  let yPos = 0;
  
  layout.forEach((rowSize, rowIndex) => {
    const xOffset = (5 - rowSize) / 2; // Center the row
    
    for (let x = 0; x < rowSize; x++) {
      const resourceIndex = (hexId % (resourceTypes.length - 1)); // Exclude desert
      const resourceType = hexId === 9 ? 'desert' : resourceTypes[resourceIndex];
      
      hexes.push({
        id: `hex-${hexId}`,
        type: resourceType,
        number: resourceType !== 'desert' ? [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12][hexId % 18] : undefined,
        position: {
          x: x + xOffset,
          y: rowIndex
        }
      });
      
      hexId++;
    }
    
    yPos++;
  });
  
  return hexes;
};

interface GameFormProps {
  onSave: () => void;
  initialGame?: GameSession;
}

export const GameForm: React.FC<GameFormProps> = ({ onSave, initialGame }) => {
  const { players, addGame, updateGame } = useGameStore();
  
  const [date, setDate] = useState(initialGame?.date || format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(initialGame?.duration || 60);
  const [notes, setNotes] = useState(initialGame?.notes || '');
  const [tags, setTags] = useState<string[]>(initialGame?.tags || []);
  const [newTag, setNewTag] = useState('');
  
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>(
    initialGame?.players || []
  );
  
  const [boardSetup, setBoardSetup] = useState<BoardSetup>({
    hexTiles: generateDefaultBoard(),
    numberTokens: [],
    harbors: [],
    robberPosition: { x: 0, y: 0 },
    buildings: [],
    roads: []
  });

  const [boardName, setBoardName] = useState('');
  const { savedBoards, saveBoard } = useGameStore();

  const handleSaveBoard = () => {
    if (!boardName.trim()) {
      alert('Please enter a name for the board setup');
      return;
    }
    
    saveBoard({
      ...boardSetup,
      name: boardName.trim()
    });
    
    setBoardName('');
    alert('Board setup saved successfully!');
  };

  const addPlayer = () => {
    if (gamePlayers.length >= 6) return;
    
    const availablePlayers = players.filter(
      player => !gamePlayers.some(gp => gp.playerId === player.id)
    );
    
    if (availablePlayers.length === 0) return;
    
    const nextPlayer = availablePlayers[0];
    const availableColors = playerColors.filter(
      color => !gamePlayers.some(gp => gp.color === color)
    );
    
    const newGamePlayer: GamePlayer = {
      id: uuidv4(),
      playerId: nextPlayer.id,
      name: nextPlayer.name,
      color: availableColors[0] || 'red',
      score: 0,
      rank: gamePlayers.length + 1,
      resourceProduction: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      buildings: { roads: 0, settlements: 0, cities: 0, devCards: 0 }
    };
    
    setGamePlayers([...gamePlayers, newGamePlayer]);
  };
  
  const removePlayer = (id: string) => {
    const updatedPlayers = gamePlayers.filter(player => player.id !== id);
    // Update ranks
    const rankedPlayers = updatedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
    setGamePlayers(rankedPlayers);
  };
  
  const updatePlayerScore = (id: string, score: number) => {
    const updatedPlayers = gamePlayers.map(player => 
      player.id === id ? { ...player, score } : player
    );
    
    // Sort by score and update ranks
    const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
    const rankedPlayers = sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
    
    setGamePlayers(rankedPlayers);
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (gamePlayers.length < 2) {
      alert('You need at least 2 players for a game');
      return;
    }
    
    const gameData: Omit<GameSession, 'id'> = {
      date,
      duration,
      players: gamePlayers,
      winner: gamePlayers.find(p => p.rank === 1)?.playerId || '',
      boardSetup,
      notes,
      tags
    };
    
    if (initialGame) {
      updateGame(initialGame.id, gameData);
    } else {
      addGame(gameData);
    }
    
    onSave();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Players</CardTitle>
            <Button 
              type="button" 
              onClick={addPlayer}
              variant="secondary"
              size="sm"
              icon={<UserPlus size={16} />}
              disabled={gamePlayers.length >= 6 || players.length === 0}
            >
              Add Player
            </Button>
          </CardHeader>
          <CardContent>
            {gamePlayers.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Add players to the game</p>
            ) : (
              <div className="space-y-3">
                {gamePlayers.map((player) => (
                  <div key={player.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                    <div 
                      className="h-4 w-4 rounded-full" 
                      style={{ backgroundColor: player.color }}
                    />
                    <div className="flex-1">
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePlayerScore(player.id, Math.max(0, player.score - 1))}
                        icon={<Minus size={16} />}
                      />
                      <span className="w-8 text-center">{player.score}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePlayerScore(player.id, player.score + 1)}
                        icon={<Plus size={16} />}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      Rank: {player.rank}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                      icon={<X size={16} />}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Game Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="Strategy notes, memorable moments..."
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Add a tag"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-emerald-400 hover:bg-emerald-200 hover:text-emerald-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Save Board Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="boardName" className="block text-sm font-medium text-gray-700">
                  Board Setup Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="boardName"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="Enter a name for this board setup"
                  />
                  <Button
                    type="button"
                    onClick={handleSaveBoard}
                    className="rounded-l-none"
                  >
                    Save Board
                  </Button>
                </div>
              </div>
              
              {savedBoards.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saved Board Setups
                  </label>
                  <div className="space-y-2">
                    {savedBoards.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <span className="font-medium">{saved.name}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBoardSetup(saved)}
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
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
          Save Game
        </Button>
      </div>
    </form>
  );
};